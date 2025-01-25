from flask import Blueprint, jsonify, request
from src.models.patient import Patient, TriageLevel, PatientStatus
from src.extensions import db
import uuid
from datetime import datetime

# Create the Blueprint
patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/register', methods=['POST'])
def register_patient():
    """Register a new patient"""
    data = request.get_json()
    
    # Generate QR code
    qr_code = str(uuid.uuid4())
    
    try:
        new_patient = Patient(
            name=data['name'],
            triage_level=TriageLevel[data['triage_level']],
            status=PatientStatus.REGISTERED,
            qr_code=qr_code
        )
        
        db.session.add(new_patient)
        db.session.commit()
        
        return jsonify(new_patient.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@patient_bp.route('/status/<string:qr_code>', methods=['GET'])
def get_patient_status(qr_code):
    """Get patient status using QR code"""
    patient = Patient.query.filter_by(qr_code=qr_code).first_or_404()
    return jsonify(patient.to_public_dict())

@patient_bp.route('/update-status/<int:patient_id>', methods=['PUT'])
def update_patient_status(patient_id):
    """Update patient status"""
    patient = Patient.query.get_or_404(patient_id)
    data = request.get_json()
    
    try:
        patient.status = PatientStatus[data['status']]
        patient.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify(patient.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@patient_bp.route('/queue', methods=['GET'])
def get_queue():
    """Get current ED queue"""
    patients = Patient.query.filter(
        Patient.status != PatientStatus.DISCHARGED
    ).order_by(
        Patient.triage_level,
        Patient.created_at
    ).all()
    
    return jsonify([p.to_public_dict() for p in patients])