# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Set OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        # Send user input to OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful chatbot designed to assist patients in the emergency room. Explain medical terms clearly, provide reassurance, and answer questions about the ED process."},
                {"role": "user", "content": user_message}
            ],
            max_tokens=150
        )

        # Extract chatbot reply
        bot_reply = response['choices'][0]['message']['content']

        return jsonify({'reply': bot_reply}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
