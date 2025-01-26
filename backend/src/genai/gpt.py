from dotenv import load_dotenv
from hospital_data.hospital_api import get_patient_data
load_dotenv()

def get_chatgpt_response(openai_client:any,user_message:str,patient_id:str):
    system_message = """You are a helpful chatbot designed to assist patients in the emergency room. 
        Explain medical terms clearly, provide reassurance, and answer questions about the ED process. Keep your answers concise and to the point. Do not under any circumstance give medical advice."""

    patient_context=""
    if patient_id:
        formatted_id = f"anon_{patient_id}"
        patient_info = get_patient_data(formatted_id)
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
    message = ""
    
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

    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[ 
            {"role": "system", "content": system_message},
            {"role": "user", "content": message}
        ],
        #max_tokens=450
    )

    bot_reply = response.choices[0].message.content
    return bot_reply