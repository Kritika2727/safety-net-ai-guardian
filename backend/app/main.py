from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from .database import connection, initialise
from .services import TRANSLATIONS, dispatch_message, event, safe_route

ROOT = Path(__file__).resolve().parents[2]

@asynccontextmanager
async def lifespan(app):
    initialise()
    yield

app = FastAPI(title="Safety Net", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Contact(BaseModel): name:str; phone:str; role:str; language:str="en"
class Trip(BaseModel): origin:str; destination:str
class Escalation(BaseModel): trip_id:int; tier:int=1

@app.get("/api/health")
def health(): return {"ok":True, "mode":"demo"}

@app.get("/api/translate/{language}")
def translate(language:str): return TRANSLATIONS.get(language, TRANSLATIONS["en"])

@app.get("/api/route")
def route(origin:str="MG Road", destination:str="Indiranagar"):
    return safe_route(origin, destination)

@app.get("/api/contacts")
def contacts():
    with connection() as con: return [dict(row) for row in con.execute("SELECT * FROM contacts ORDER BY role")]

@app.post("/api/contacts", status_code=201)
def add_contact(contact:Contact):
    if contact.role not in ("guardian","parent"): raise HTTPException(400,"role must be guardian or parent")
    with connection() as con:
        cursor=con.execute("INSERT INTO contacts(name,phone,role,language) VALUES (?,?,?,?)", tuple(contact.model_dump().values()))
        return {"id":cursor.lastrowid, **contact.model_dump()}

@app.post("/api/trips", status_code=201)
def start_trip(trip:Trip):
    with connection() as con:
        cur=con.execute("INSERT INTO trips(origin,destination,status) VALUES (?,?, 'armed')",(trip.origin,trip.destination))
        return {"id":cur.lastrowid,"status":"armed", "route":safe_route(trip.origin,trip.destination)}

@app.post("/api/trips/{trip_id}/check-in")
def checkin(trip_id:int):
    with connection() as con:
        if not con.execute("SELECT 1 FROM trips WHERE id=?",(trip_id,)).fetchone(): raise HTTPException(404,"trip not found")
        con.execute("INSERT INTO anomalies(trip_id,kind,status) VALUES (?, 'stoppage', 'check-in')",(trip_id,))
    return event("check-in", "Are you safe? Please confirm.")

@app.post("/api/escalations")
def escalate(request:Escalation):
    role = "guardian" if request.tier == 1 else "parent"
    with connection() as con:
        targets=[dict(row) for row in con.execute("SELECT * FROM contacts WHERE role=?",(role,))]
        for person in targets:
            con.execute("INSERT INTO escalations(trip_id,contact_id,tier,channel,status,message) VALUES (?,?,?,?,?,?)",(request.trip_id,person["id"],request.tier,"voice+sms","simulated",dispatch_message(person["name"],request.tier)))
    return {"tier":request.tier,"targets":targets,"message":dispatch_message("contact",request.tier),"mode":"simulated"}

@app.post("/api/trips/{trip_id}/complete")
def complete(trip_id:int):
    with connection() as con: con.execute("UPDATE trips SET status='complete' WHERE id=?",(trip_id,))
    return {"id":trip_id,"status":"complete"}

app.mount("/", StaticFiles(directory=ROOT / "frontend", html=True), name="frontend")
