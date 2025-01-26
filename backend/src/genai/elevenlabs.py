import requests
import os
import speech_recognition as sr

from config import ELEVENLABS_API_KEY, ELEVENLABS_API_URL

def speak_eleven_labs(text):
    headers = {
        "Authorization": f"Bearer {ELEVENLABS_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "text": text,
        "voice": "en_us_male",
        "output_format": "mp3"
    }

    response = requests.post(ELEVENLABS_API_URL, headers=headers, json=data)

    if response.status_code == 200:
        with open("response_audio.mp3", "wb") as f:
            f.write(response.content)
        print("Speech generated successfully.")
        os.system("start response_audio.mp3")
    else:
        print(f"Error: {response.status_code}, {response.text}")

def listen():
    recognizer = sr.Recognizer()

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