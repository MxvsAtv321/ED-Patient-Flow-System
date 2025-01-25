from flask import Flask, jsonify, request
from flask_mail import Mail, Message
from flasgger import Swagger
from config import BACKEND_PORT
import logging
import os
from dotenv import load_dotenv

from hospital_data.expected_time import compute_expected_time_seconds

load_dotenv()
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

app.config["MAIL_SERVER"] = os.getenv('MAIL_SERVER')
app.config["MAIL_PORT"] = os.getenv('MAIL_PORT')
app.config["MAIL_USERNAME"] = os.getenv('MAIL_USERNAME')
app.config["MAIL_PASSWORD"] = os.getenv('MAIL_PASSWORD')
app.config["MAIL_USE_TLS"] = os.getenv('MAIL_USE_TLS') == 'True'
app.config["MAIL_USE_SSL"] = os.getenv('MAIL_USE_SSL') == 'True'
mail = Mail(app)

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

@app.route("/email/<patient_id>", methods=["POST"])
def send_email(patient_id: str):
    """
    Send email with clickable link 
    ---
    parameters:
      - name: patient_id
        in: path
        type: string
        required: true
        description: The ID of the patient
      - name: emails
        in: body
        type: array
        required: true
        description: List of recipient email addresses 
    responses:
      200:
        description: Email sent successfully
      500:
        description: Failed to send email
    """
    data = request.get_json()
    emails = data.get('emails', [])
    link = f"http://localhost:3000/patient/anon_{patient_id}"
    logger.info(f"Received emails: {emails}, link: {link} for patient_id: {patient_id}")

    try:
        for email in emails:
          msg = Message(
              subject="Hospital Visit Tracking",
              sender="noreply@hospital.com",
              recipients=[email],
              body=f"Hello,\n\nHere is the link to track your loved one's ED visit: {link}\n\nPatient ID: {patient_id}\n\nHave a good day."
          )
          msg.html = f"""
                <p>Hello,</p>
                <p>Here is the link to track your loved one's ED visit:</p>
                <p><a href="{link}">Click here to track</a></p>
                <p>Patient ID: {patient_id}</p>
                <p>Have a good day.</p>
            """
          mail.send(msg)
          logger.info(f"Email sent successfully to {email} for patient_id: {patient_id}")
        return jsonify({"message": "Email sent successfully"}), 200
    except Exception as e:
        logger.error(f"Failed to send email: {e} for patient_id: {patient_id}")
        return jsonify({"error": "Failed to send email"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=BACKEND_PORT)
