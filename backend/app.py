from flask import Flask, jsonify
from flasgger import Swagger

app = Flask(__name__)
swagger = Swagger(app)

MOCK_WAIT_TIMES = [
    {
        "triage_level": "Blue (I)",
        "description": "Severely ill, requires resuscitation",
        "avg_wait_minutes": 2
    },
    {
        "triage_level": "Red (II)",
        "description": "Emergent care, rapid intervention",
        "avg_wait_minutes": 15
    },
    {
        "triage_level": "Yellow (III)",
        "description": "Urgent care",
        "avg_wait_minutes": 45
    },
    {
        "triage_level": "Green (IV)",
        "description": "Less urgent care",
        "avg_wait_minutes": 90
    },
    {
        "triage_level": "White (V)",
        "description": "Non-urgent care",
        "avg_wait_minutes": 120
    }
]


@app.route("/")
def index():
    return "Hello world or something"

@app.route("/expected_wait_time", methods=["GET"])
def get_wait_times():
    return jsonify(MOCK_WAIT_TIMES)

if __name__ == "__main__":
    app.run(debug=True)
