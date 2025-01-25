from flask import current_app
from hospital_data.hospital_api import get_patient_data, get_hospital_state

def compute_expected_time_seconds(patient_id: str) -> str:
    triage_cat = str(get_patient_data(patient_id)['triage_category'])
    current_app.logger.info(f"fetched triage category for patient {patient_id}: {triage_cat}")
    wait_time_for_cat = get_hospital_state()['averageWaitTimes'][triage_cat]
    current_app.logger.info(f"wait time for {patient_id}: {wait_time_for_cat}")
    return wait_time_for_cat

if __name__ == "__main__":
    compute_expected_time_seconds(1)