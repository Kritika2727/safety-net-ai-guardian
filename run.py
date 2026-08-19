import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "backend"))
import uvicorn
uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
