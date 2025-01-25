from flask import Flask, jsonify
from flasgger import Swagger
from config import BACKEND_PORT
import logging

from hospital_data.expected_time import compute_expected_time_seconds

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

    return jsonify({
        "expectedTime": compute_expected_time_seconds(patient_id)
    })

if __name__ == "__main__":
    app.run(debug=True, port=BACKEND_PORT)
