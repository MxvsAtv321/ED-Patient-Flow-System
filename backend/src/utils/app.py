from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("OPENAI_API_KEY")

IFEM_API_BASE_URL = "https://ifem-award-mchacks-2025.onrender.com/api/v1"

def get_patient_info(patient_id):
    """Fetch patient information from IFEM API"""
    try:
        response = requests.get(f"{IFEM_API_BASE_URL}/patient/{patient_id}")
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        print(f"Error fetching patient data: {e}")
        return None

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        patient_id = request.json.get('patient_id')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        system_message = """You are a helpful chatbot designed to assist patients in the emergency room. 
        Explain medical terms clearly, provide reassurance, and answer questions about the ED process."""

        if patient_id:
            patient_info = get_patient_info(patient_id)
            if patient_info:
                patient_context = f"""
                Current patient information:
                - Triage Category: {patient_info.get('triage_category')}
                - Current Phase: {patient_info.get('status', {}).get('current_phase')}
                - Time Elapsed: {patient_info.get('time_elapsed')} minutes
                - Queue Position: {patient_info.get('queue_position', {}).get('global')}
                - Investigation Status: Labs: {patient_info.get('status', {}).get('investigations', {}).get('labs')}, 
                  Imaging: {patient_info.get('status', {}).get('investigations', {}).get('imaging')}
                """
                system_message += "\n" + patient_context

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            max_tokens=150
        )

        bot_reply = response['choices'][0]['message']['content']

        return jsonify({'reply': bot_reply}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)