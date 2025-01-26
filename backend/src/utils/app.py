import requests
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