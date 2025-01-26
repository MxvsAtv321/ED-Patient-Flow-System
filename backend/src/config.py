from dotenv import load_dotenv
import os

load_dotenv()

CURRENT_HOSPITAL_STATE_URL = "https://ifem-award-mchacks-2025.onrender.com/api/v1/stats/current"
SPECIFIC_PATIENT_INFO_URL = "https://ifem-award-mchacks-2025.onrender.com/api/v1/patient/%s"
QUEUE_DATA_URL = "https://ifem-award-mchacks-2025.onrender.com/api/v1/queue"
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech/generate"

BACKEND_PORT = 5000
DB_PATH = "db/hospital_data.db"

MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_SERVER="smtp.gmail.com"
MAIL_PORT=587
MAIL_USERNAME = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

