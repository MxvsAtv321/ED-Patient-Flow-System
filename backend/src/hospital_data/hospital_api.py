import requests
from config import CURRENT_HOSPITAL_STATE_URL, SPECIFIC_PATIENT_INFO_URL, QUEUE_DATA_URL
from typing import Dict, Any

def get_hospital_state() -> Dict[str, Any]:
    return requests.get(CURRENT_HOSPITAL_STATE_URL).json()

def get_patient_data(patient_id: str) -> Dict[str, Any]:
    return requests.get(SPECIFIC_PATIENT_INFO_URL.format(patient_id=patient_id)).json()

def get_queue_data() -> Dict[str, Any]:
    return requests.get(QUEUE_DATA_URL).json
