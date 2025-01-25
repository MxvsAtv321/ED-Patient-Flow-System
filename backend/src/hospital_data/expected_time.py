from hospital_data.hospital_getters import get_patient_data, get_hospital_state

def compute_expected_time_seconds(patient_id: int) -> str:
    triage_cat = str(get_patient_data(patient_id)['triage_category'])
    print("tg:", triage_cat)
    wait_time_for_cat = get_hospital_state()['averageWaitTimes'][triage_cat]
    print("wt:",wait_time_for_cat)
    return str(wait_time_for_cat)

if __name__ == "__main__":
    compute_expected_time_seconds(1)