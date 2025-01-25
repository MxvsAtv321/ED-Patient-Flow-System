from flask import Flask, jsonify
from flasgger import Swagger
from config import BACKEND_PORT

from hospital_data.expected_time import compute_expected_time_seconds

app = Flask(__name__)
swagger = Swagger(app)


@app.route("/")
def index():
    return "Hello world or something"

@app.route("/patient", methods=["GET"])
def get_wait_times():
    return jsonify({
        "expectedTime": compute_expected_time_seconds(1)
    })

if __name__ == "__main__":
    app.run(debug=True, port=BACKEND_PORT)
