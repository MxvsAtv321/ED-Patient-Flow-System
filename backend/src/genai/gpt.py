import os
import google.generativeai as genai
from dotenv import load_dotenv
from hospital_data.hospital_api import get_patient_data
load_dotenv()

def get_chatgpt_response(openai_client:any, user_message:str, patient_id:str):
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set")

    genai.configure(api_key=GEMINI_API_KEY)
    
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",
        generation_config=generation_config,
    )

    system_message = """You are a helpful chatbot designed to assist patients in the emergency room. 
        Explain medical terms clearly, provide reassurance, and answer questions about the ED process. Keep your answers concise and to the point. Do not under any circumstance give medical advice."""

    patient_context = ""
    if patient_id:
        patient_info = get_patient_data(patient_id)
        if patient_info:
            patient_context = f"""
            Current patient information:
            - Triage Category: {patient_info.triage_category}
            - Current Phase: {patient_info.status}
            - Time Elapsed: {patient_info.wait_time} minutes
            - Queue Position: {patient_info.queue_global}
            - Investigation Status: Labs: {patient_info.labs}, 
                Imaging: {patient_info.imaging}
            """
            system_message += "\n" + patient_context
    
    if patient_context:
        message = f"""
        You are a helpful chatbot designed to assist this patient in an emergency room by answering their query.\n\n
        Here is the patient information:\n
        {patient_context}
        \n\n
        Here is the patient query:\n
        {user_message}\n\n
        Do not under any circumstance give medical advice.
        """
    else:
        message = f"""
        You are a helpful chatbot designed to assist this patient in an emergency room by answering their query.\n\n
        Here is the patient query:\n
        {user_message}\n\n
        Do not under any circumstance give medical advice.
        """

    chat = model.start_chat(history=[
        {"role": "user", "parts": [system_message]},
    ])
    
    response = chat.send_message(message)
    return response.text