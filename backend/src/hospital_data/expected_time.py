from hospital_data.hospital_api import get_all_patient_data, get_patient_data, Patient

from typing import List

def _sum_of_wait_times(patients: List[Patient], patient_category: str) -> int:
    filtered_patients = list(filter(lambda x: x.triage_category == patient_category, patients))
    average = (
        sum(
            int(p.wait_time) 
            for p in filtered_patients 
            if isinstance(p.wait_time, int) or (isinstance(p.wait_time, str) and p.wait_time.isdigit())
        ) 
        / len(filtered_patients)
        if filtered_patients else 0
    )
    return int(average)

def compute_expected_time_seconds(patient_id: str) -> int:
    patient = get_patient_data(patient_id)
    if patient == None:
        return -1
    patients = get_all_patient_data()
    patient_category = patient.triage_category

    return _sum_of_wait_times(patients, patient_category)

if __name__ == "__main__":
    compute_expected_time_seconds(1)