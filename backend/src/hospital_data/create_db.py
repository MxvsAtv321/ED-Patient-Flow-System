import requests
import sqlite3
from os import path
from config import QUEUE_DATA_URL, DB_PATH
from typing import Dict, Any

def save_hospital_data() -> None:
    def _get_queue_data() -> Dict[str, Any]:
        return requests.get(QUEUE_DATA_URL).json()

    if path.exists(DB_PATH):
        return None

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patient_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anon_id TEXT UNIQUE,
            arrival_time TIMESTAMP,
            queue_global INTEGER,
            queue_local INTEGER,
            status TEXT,
            imaging TEXT DEFAULT 'NA',
            labs TEXT DEFAULT 'NA',
            triage_category INTEGER,
            wait_time INTEGER
        )
    """)
    queue_data = _get_queue_data()

    for patient in queue_data['patients']:
        anon_id = patient.get('id')
        arrival_time = patient.get('arrival_time')
        wait_time = patient.get('time_elapsed')

        queue_global = patient.get('queue_position', {}).get('global')
        queue_local = patient.get('queue_position', {}).get('category')
        
        status = patient.get('status', {}).get('current_phase')
        
        investigations = patient.get('status', {}).get('investigations', {})
        imaging = investigations.get('imaging', 'NA')
        labs = investigations.get('labs', 'NA')
        
        triage_category = patient.get('triage_category')

        cursor.execute(
            """
            INSERT INTO patient_data (
                anon_id,
                arrival_time,
                queue_global,
                queue_local,
                status,
                imaging,
                labs,
                triage_category,
                wait_time
            )
            VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                anon_id,
                arrival_time,
                queue_global,
                queue_local,
                status,
                imaging,
                labs,
                triage_category,
                wait_time
            )
        )

    conn.commit()
    conn.close()
    
    print(f"Hospital data saved to {DB_PATH}")