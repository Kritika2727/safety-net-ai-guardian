"""Run with: pip install -r backend/requirements.txt httpx && python test_api.py"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent / "backend"))
from fastapi.testclient import TestClient
from app.main import app

with TestClient(app) as client:
    assert client.get("/api/health").json()["ok"]
    assert client.get("/api/translate/hi").json()["safe"]
    route = client.get("/api/route", params={"origin":"A", "destination":"B"}).json()
    assert route["safety_index"] >= 0 and route["steps"]
    assert client.get("/api/contacts").json()
    trip = client.post("/api/trips", json={"origin":"A", "destination":"B"}).json()
    assert trip["status"] == "armed"
    assert client.post(f"/api/trips/{trip['id']}/check-in").json()["kind"] == "check-in"
    assert client.post("/api/escalations", json={"trip_id":trip["id"], "tier":1}).json()["mode"] == "simulated"
    assert client.post(f"/api/trips/{trip['id']}/complete").json()["status"] == "complete"
print("All Safety Net API checks passed.")
