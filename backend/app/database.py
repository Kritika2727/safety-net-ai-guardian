from pathlib import Path
import sqlite3

DB_PATH = Path(__file__).resolve().parents[1] / "safety_net.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('guardian','parent')), language TEXT DEFAULT 'en'
);
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT, origin TEXT, destination TEXT,
  status TEXT NOT NULL DEFAULT 'armed', created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS anomalies (
  id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id INTEGER, kind TEXT, status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS escalations (
  id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id INTEGER, contact_id INTEGER,
  tier INTEGER, channel TEXT, status TEXT, message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"""

def connection():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def initialise():
    with connection() as con:
        con.executescript(SCHEMA)
        if not con.execute("SELECT 1 FROM contacts LIMIT 1").fetchone():
            con.executemany("INSERT INTO contacts(name,phone,role,language) VALUES (?,?,?,?)", [
              ("Aarav Sharma", "+91 98765 43210", "guardian", "en"),
              ("Meera Sharma", "+91 98765 43211", "parent", "hi"),
              ("Raj Sharma", "+91 98765 43212", "parent", "en"),
            ])
