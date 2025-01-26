from flask import current_app
from typing import Tuple
from hospital_data.hospital_api import get_patient_data, get_all_patient_data

def get_queue_stats(patient_id: str) -> Tuple[int, int, int]:
    patient_list = get_all_patient_data()
    print("patient_list:", patient_list)

    patient_position_local = 0
    patient_position_global = 0
    total_in_queue = len(patient_list) # GET FOR TRIAGE CATEGORY

    for patient in patient_list:
        if patient.anon_id == patient_id:
            patient_position_local = patient.queue_local
            patient_position_global= patient.queue_global

    current_app.logger.info(patient_list)

    return (patient_position_local, patient_position_global, total_in_queue) 
