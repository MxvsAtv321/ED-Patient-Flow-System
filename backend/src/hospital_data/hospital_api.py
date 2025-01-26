import sqlite3

from config import DB_PATH
from typing import List

class Patient:
    def __init__(self, pid, anon_id, arrival_time, queue_global, queue_local, status, imaging, labs, triage_category, wait_time):
        self.id = pid
        self.anon_id = anon_id
        self.arrival_time = arrival_time
        self.queue_global = queue_global
        self.queue_local = queue_local
        self.status = status
        self.imaging = imaging
        self.labs = labs
        self.triage_category = triage_category
        self.wait_time = wait_time

    def to_dict(self):
        return self.__dict__

def get_patient_data(patient_id: str) -> Patient:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patient_data WHERE anon_id = ? ORDER BY id DESC LIMIT 1", (patient_id,))
    result = cursor.fetchone()
    if result == None:
        return None 
    conn.close()
    return Patient(*result)


def get_all_patient_data() -> List[Patient]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patient_data")
    result = cursor.fetchall()
    print("result:", result)
    retlist = []
    for patient in result:
        retlist.append(Patient(*patient))
    conn.close()
    return retlist

