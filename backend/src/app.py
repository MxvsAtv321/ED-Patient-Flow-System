from flask import Flask, jsonify
from flasgger import Swagger
from config import BACKEND_PORT
import logging

from hospital_data.expected_time import compute_expected_time_seconds
from hospital_data.create_db import save_hospital_data
from hospital_data.hospital_api import get_patient_data, get_all_patient_data
from hospital_data.queue_data import get_queue_stats

app = Flask(__name__)
swagger = Swagger(app)

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s [%(levelname)s] - %(message)s",
    handlers=[
        logging.StreamHandler(), 
        logging.FileHandler("app.log", mode='a') 
    ]
)

logger = logging.getLogger(__name__)

@app.route("/")
def index():
    return "Hello world or something"

@app.route("/patient/<patient_id>", methods=["GET"])
def get_wait_times(patient_id: str):
    """
    Retrieve patient data
    ---
    parameters:
      - name: patient_id
        in: path
        type: string
        required: true
        description: The ID of the patient
    responses:
      200:
        description: Patient data object
        schema:
          type: object
          properties:
            expectedTime:
              type: integer
              description: Expected time until next phase in seconds
    """

    queue_data = get_queue_stats(patient_id)
    patient_data = get_patient_data(patient_id)
    expected_time = compute_expected_time_seconds(patient_id)
    if expected_time == -1:
        return {"error": f"no such patient_id {patient_id}"}

    return jsonify({
        "arrivalTime": patient_data.arrival_time,
        "elapsedTime": patient_data.wait_time,
        "triage": patient_data.triage_category,
        "expectedTime": expected_time,
        "queuePositionLocal": queue_data[0],
        "queuePositionGlobal": queue_data[1],
        "queueMax": queue_data[2],
        "allPatients": len(get_all_patient_data())
    })

if __name__ == "__main__":
    save_hospital_data()
    app.run(debug=True, port=BACKEND_PORT)
