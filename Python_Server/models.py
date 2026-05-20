from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user') # 'admin', 'user', 'guest'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to biometrics
    biometric = db.relationship('Biometric', backref='user', uselist=False, cascade="all, delete-orphan")

class Biometric(db.Model):
    __tablename__ = 'biometrics'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    encrypted_template = db.Column(db.LargeBinary, nullable=False)
    encrypted_dek = db.Column(db.LargeBinary, nullable=False)
    nonce = db.Column(db.LargeBinary, nullable=False)
    is_guest = db.Column(db.Boolean, default=False)
    consent_recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        db.CheckConstraint(
            '(user_id IS NOT NULL AND is_guest = 0) OR (user_id IS NULL AND is_guest = 1)',
            name='check_guest_user_mutual_exclusion'
        ),
    )

class AccessLog(db.Model):
    """Records every door access attempt — granted, denied, or OTP-triggered."""
    __tablename__ = 'access_logs'

    id         = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name       = db.Column(db.String(100), nullable=False)          # Resident name or "Unknown"
    event_type = db.Column(db.String(20),  nullable=False)          # 'granted' | 'denied' | 'otp_sent'
    confidence = db.Column(db.Float,       nullable=True)           # 0-100 match confidence
    method     = db.Column(db.String(20),  default='face_scan')     # 'face_scan' | 'otp' | 'manual'
    timestamp  = db.Column(db.DateTime,    default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'event_type': self.event_type,
            'confidence': round(self.confidence, 1) if self.confidence else None,
            'method':     self.method,
            'timestamp':  self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'time_ago':   _time_ago(self.timestamp),
        }

def _time_ago(dt):
    """Returns a human-readable relative time string."""
    diff = (datetime.utcnow() - dt).total_seconds()
    if diff < 60:      return f"{int(diff)}s ago"
    if diff < 3600:    return f"{int(diff//60)}m ago"
    if diff < 86400:   return f"{int(diff//3600)}h ago"
    return dt.strftime('%d %b')
