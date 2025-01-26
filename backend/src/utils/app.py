
import openai
import speech_recognition as sr
import os


# Set up your API keys
OPENAI_API_KEY = "your_openai_api_key"
ELEVEN_LABS_API_KEY = "sk_80761db1aac9448c4e5d0f8f06d266fa8c761c1a036c34b5"
API_URL = "https://api.elevenlabs.io/v1/text-to-speech/generate"

# Set up OpenAI (ChatGPT)
openai.api_key = OPENAI_API_KEY

# Initialize Speech Recognizer
recognizer = sr.Recognizer()

# Function for ChatGPT API response
def get_chatgpt_response(prompt):
    response = openai.Completion.create(
        model="gpt-3.5-turbo",  # or "gpt-4" if you have access to GPT-4
        prompt=prompt,
        max_tokens=150
    )
    return response.choices[0].text.strip()

# Function for Eleven Labs TTS (Text-to-Speech)
def speak_eleven_labs(text):
    headers = {
        "Authorization": f"Bearer {ELEVEN_LABS_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "text": text,
        "voice": "en_us_male",  # You can change the voice here
        "output_format": "mp3"
    }
    
    # Request TTS from Eleven Labs API
    response = requests.post(API_URL, headers=headers, json=data)
    
    if response.status_code == 200:
        # Save and play the audio
        with open("response_audio.mp3", "wb") as f:
            f.write(response.content)
        print("Speech generated successfully.")
        os.system("start response_audio.mp3")  # For Windows; use 'open' for Mac or 'xdg-open' for Linux
    else:
        print(f"Error: {response.status_code}, {response.text}")

# Function for Speech-to-Text (STT)
def listen():
    with sr.Microphone() as source:
        print("Listening for your command...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
=======
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
>>>>>>> fe0ee10ba4af9435a4a155396c9962db48c895a9

        try:
            text = recognizer.recognize_google(audio)
            print(f"You said: {text}")
            return text
        except sr.UnknownValueError:
            print("Sorry, I could not understand your speech.")
            return None
        except sr.RequestError:
            print("Request error. Please check your internet connection.")
            return None

<<<<<<< HEAD
# Chatbot loop (Integrated with ChatGPT, STT, and Eleven Labs TTS)
while True:
    user_input = listen()
    if user_input:
        # Get ChatGPT response for the user's input
        chatgpt_response = get_chatgpt_response(user_input)
        
        # Send the response to Eleven Labs to convert to speech
        speak_eleven_labs(chatgpt_response)
    else:
        speak_eleven_labs("I couldn't hear anything. Please try again.")
=======
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
>>>>>>> fe0ee10ba4af9435a4a155396c9962db48c895a9
