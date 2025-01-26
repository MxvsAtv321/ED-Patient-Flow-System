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

def get_wait_times_by_cat() -> List[int]:
    patients = get_all_patient_data()
    categories = [1,2,3,4,5]
    
    return [
        _sum_of_wait_times(patients, category)/5
        for category in categories
    ]

def get_patient_number_by_cat() -> List[int]:
    patients = get_all_patient_data()
    categories = [1, 2, 3, 4, 5]
    
    return [
        len([p for p in patients if int(p.triage_category) == category])
        for category in categories
    ]


def longest_wait_time() -> int:
    patients = get_all_patient_data()
    wait_times = (
            int(p.wait_time) 
            for p in patients 
            if isinstance(p.wait_time, int) or (isinstance(p.wait_time, str) and p.wait_time.isdigit())
    )
    return max(wait_times)

def compute_expected_time_seconds(patient_id: str) -> int:
    patient = get_patient_data(patient_id)
    if patient == None:
        return -1
    patients = get_all_patient_data()
    patient_category = patient.triage_category

    return _sum_of_wait_times(patients, patient_category)

if __name__ == "__main__":
    compute_expected_time_seconds(1)