from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent.parent
sys.path.append(str(backend_path))

from src.extensions import db, jwt
from src.routes.patient_routes import patient_bp
from src.utils.error_handlers import register_error_handlers

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config.from_object('src.config.database.Config')

    db.init_app(app)
    jwt.init_app(app)

    register_error_handlers(app)
    app.register_blueprint(patient_bp, url_prefix='/api/v1')

    with app.app_context():
        db.create_all()

    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'ED Patient Flow System is running'
        })

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=int(os.getenv('PORT', 5000)))