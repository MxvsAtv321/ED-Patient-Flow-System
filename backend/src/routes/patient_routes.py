from flask import Blueprint, jsonify, request 
from src.models.patient import Patient, TriageLevel, PatientStatus 
from src.extensions import db 
import uuid 
from datetime import datetime 
 
patient_bp = Blueprint('patient', __name__) 
