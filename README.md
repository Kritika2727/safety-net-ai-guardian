# Safety Net — AI Guardian

An AI-assisted personal safety demo with a FastAPI + SQLite backend and responsive browser interface. It models three agents: Guardian check-ins, multilingual text prompts, and a voice/SMS dispatch simulator.

## Run locally

Requires Python 3.10+.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python run.py
```

Open `http://localhost:8000`. API documentation is at `/docs`.

## Deployment

This is ready for a Python web host such as Render or Railway:

- Build command: `pip install -r backend/requirements.txt`
- Start command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`

For persistent data in production, replace the local SQLite file with a managed database. Voice/SMS calls are intentionally simulated in this version; integrate a verified telephony provider only after configuring consent, emergency handling, and credentials.

Run the API verification suite after installing `httpx`:

```powershell
pip install httpx
python test_api.py
```

## Safety note

This project is a product demo and must not be treated as an emergency-response service. In immediate danger, call local emergency services.
