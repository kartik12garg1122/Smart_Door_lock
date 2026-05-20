import cv2
import numpy as np
import os
import sys
import time
import webbrowser
import random
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import json as _json
from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime
from flask_cors import CORS
from deepface import DeepFace

# ── OTP Email Configuration ─────────────────────────────────────
# Set these before running. Use a Gmail App Password, NOT your login password.
# Gmail App Password setup: https://myaccount.google.com/apppasswords
OTP_SENDER_EMAIL    = "kartik61142@gmail.com"       # Your Gmail address
OTP_APP_PASSWORD    = "bqkh hfll qnys sfqo"        # 16-char Gmail App Password
OTP_RECIPIENT_EMAIL = "kartik61142@gmail.com"       # Where to send the OTP
OTP_LENGTH          = 4                            # Digits (must match Arduino sketch)

# ── Path Handling for PyInstaller ──────────────────────────────
def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except AttributeError:
        # Running as a normal script — look one level up (project root contains /dist)
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)

# ── Configuration ──────────────────────────────────────────────
# Data persistence: handle frozen (.exe) vs script execution
if getattr(sys, 'frozen', False):
    # If running from the .exe, look for data folders in the same directory as the .exe
    DATA_DIR = os.path.dirname(sys.executable)
else:
    # If running as a script, look for data in the 'backend' folder or current directory
    current_script_dir = os.path.dirname(os.path.abspath(__file__))
    if os.path.basename(current_script_dir) == 'Python_Server':
        DATA_DIR = current_script_dir
    else:
        # Check if we are in the root and 'backend' folder exists
        if os.path.exists(os.path.join(current_script_dir, 'Python_Server')):
            DATA_DIR = os.path.join(current_script_dir, 'Python_Server')
        else:
            DATA_DIR = current_script_dir

# Resource paths (bundled in the .exe via --add-data)
# get_resource_path resolves to _MEIPASS/dist when frozen, or ../dist when running as script
DIST_DIR = get_resource_path('dist')
CASCADE_PATH = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')

# Data paths (external to the .exe for persistence)
DATASET_PATH = os.path.join(DATA_DIR, 'dataset')
TRAINER_PATH = os.path.join(DATA_DIR, 'trainer', 'trainer.yml')
LABELS_PATH = os.path.join(DATA_DIR, 'trainer', 'labels.json')
INTRUDERS_PATH = os.path.join(DATA_DIR, 'intruders')

# Ensure directories exist
for path in [DATASET_PATH, os.path.dirname(TRAINER_PATH), INTRUDERS_PATH]:
    if not os.path.exists(path):
        os.makedirs(path)

# Initialize Flask without serving static dist folder automatically
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(DATA_DIR, 'app.db').replace('\\', '/')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'dev-secret-key'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB — allow large base64 image payloads

CORS(app)

# Global error handler — ensures ALL unhandled errors print a full traceback
@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    print(f"\n{'='*60}", flush=True)
    print(f"[FLASK ERROR] {type(e).__name__}: {e}", flush=True)
    traceback.print_exc()
    print(f"{'='*60}\n", flush=True)
    return jsonify({'success': False, 'error': f'Server error: {type(e).__name__}: {e}'}), 500


from models import db, User, Biometric, AccessLog
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from security import encrypt_face_template, decrypt_face_template

db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()
try:
    import serial
    SERIAL_CONN = serial.Serial('COM20', 9600, timeout=1, write_timeout=2)  # write_timeout prevents blocking
except Exception as e:
    print(f"[SERIAL] No device found: {e}", flush=True)
    SERIAL_CONN = None

# NOTE: Full /health route with model_ready status is defined later in this file.
# A duplicate here was removed to prevent Flask AssertionError on startup.

def safe_serial_write(data: bytes):
    """Write to serial without blocking the Flask request if Arduino is disconnected."""
    if not SERIAL_CONN:
        print("[SERIAL] Cannot send — no Arduino connected!", flush=True)
        return
    try:
        SERIAL_CONN.write(data)
        print(f"[SERIAL] Sent to Arduino: {data}", flush=True)
    except Exception as e:
        print(f"[SERIAL] Write failed: {e}", flush=True)

face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

import json
import pickle

# ── Access Log Helper ──────────────────────────────────────────
def log_access(name, event_type, confidence=None, method='face_scan'):
    """Persist a door-access event to the database (non-blocking)."""
    try:
        entry = AccessLog(
            name=name,
            event_type=event_type,
            confidence=confidence,
            method=method,
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as e:
        print(f"[LOG] Failed to write access log: {e}", flush=True)
        db.session.rollback()

def get_label_map():
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, 'r') as f:
            return {int(k): v for k, v in json.load(f).items()}
    return {}

def save_label_map(label_map):
    with open(LABELS_PATH, 'w') as f:
        json.dump(label_map, f)

def train_model():
    """Extracts DeepFace embeddings, L2-normalizes, and saves them."""
    print("[TRAINER] Starting DeepFace embedding extraction...")
    embeddings_db = {}
    
    label_map = get_label_map()
    current_ids = list(label_map.keys())
    next_id = max(current_ids) + 1 if current_ids else 0
    updated = False
    
    for name in os.listdir(DATASET_PATH):
        full_path = os.path.join(DATASET_PATH, name)
        if os.path.isdir(full_path):
            if name not in label_map.values():
                label_map[next_id] = name
                next_id += 1
                updated = True
                print(f"[TRAINER] New resident found: {name}")
    
    if updated:
        save_label_map(label_map)
                
    for label_id, name in label_map.items():
        person_path = os.path.join(DATASET_PATH, name)
        if not os.path.exists(person_path): continue
        person_embeddings = []
        skipped = 0
        for filename in os.listdir(person_path):
            if not filename.endswith(('.jpg', '.jpeg', '.png')): continue
            img_path = os.path.join(person_path, filename)
            try:
                results = DeepFace.represent(img_path=img_path, model_name='Facenet', enforce_detection=False)
                if results and len(results) > 0:
                    emb = np.array(results[0]["embedding"], dtype=np.float32)
                    # Skip near-zero embeddings (no real face detected)
                    raw_norm = np.linalg.norm(emb)
                    if raw_norm < 1e-6:
                        skipped += 1
                        continue
                    emb = emb / raw_norm  # L2-normalize
                    person_embeddings.append(emb)
            except Exception as e:
                skipped += 1
        
        if person_embeddings:
            # Average normalized embeddings, then re-normalize
            avg_embedding = np.mean(person_embeddings, axis=0).astype(np.float32)
            norm = np.linalg.norm(avg_embedding)
            if norm > 0:
                avg_embedding = avg_embedding / norm
            embeddings_db[label_id] = avg_embedding
            print(f"[TRAINER] {name}: {len(person_embeddings)} good embeddings, {skipped} skipped")
        else:
            print(f"[TRAINER] WARNING: {name}: 0 valid embeddings from {skipped} images!")

    emb_path = os.path.join(DATA_DIR, 'trainer', 'embeddings.pkl')
    with open(emb_path, 'wb') as f:
        pickle.dump(embeddings_db, f)
        
    print(f"[TRAINER] Training complete. L2-normalized embeddings saved for {len(embeddings_db)} residents.")
    return label_map

def train_single_resident(name):
    """Fast-path: only extract embeddings for ONE new resident and merge into existing DB."""
    import time
    t0 = time.time()
    print(f"[TRAINER-FAST] Training only: {name}")
    
    # Load existing embeddings
    emb_path = os.path.join(DATA_DIR, 'trainer', 'embeddings.pkl')
    if os.path.exists(emb_path):
        with open(emb_path, 'rb') as f:
            embeddings_db = pickle.load(f)
    else:
        embeddings_db = {}
    
    # Update label map
    label_map = get_label_map()
    current_ids = list(label_map.keys())
    
    # Find or assign label ID for this person
    label_id = None
    for lid, lname in label_map.items():
        if lname == name:
            label_id = lid
            break
    if label_id is None:
        label_id = max(current_ids) + 1 if current_ids else 0
        label_map[label_id] = name
        save_label_map(label_map)
    
    # Only process this person's images (sample max 5 for speed)
    person_path = os.path.join(DATASET_PATH, name)
    if not os.path.exists(person_path):
        print(f"[TRAINER-FAST] ERROR: {person_path} not found")
        return label_map
    
    all_images = [f for f in os.listdir(person_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
    # Sample evenly spaced images (max 5) for speed
    if len(all_images) > 5:
        step = len(all_images) / 5
        sampled = [all_images[int(i * step)] for i in range(5)]
    else:
        sampled = all_images
    
    person_embeddings = []
    for filename in sampled:
        img_path = os.path.join(person_path, filename)
        try:
            results = DeepFace.represent(img_path=img_path, model_name='Facenet', enforce_detection=False)
            if results and len(results) > 0:
                emb = np.array(results[0]["embedding"], dtype=np.float32)
                raw_norm = np.linalg.norm(emb)
                if raw_norm < 1e-6:
                    continue  # skip near-zero (no face)
                emb = emb / raw_norm
                person_embeddings.append(emb)
        except Exception:
            pass
    
    if person_embeddings:
        avg_embedding = np.mean(person_embeddings, axis=0).astype(np.float32)
        norm = np.linalg.norm(avg_embedding)
        if norm > 0:
            avg_embedding = avg_embedding / norm
        embeddings_db[label_id] = avg_embedding
        print(f"[TRAINER-FAST] {name}: {len(person_embeddings)} embeddings from {len(sampled)} sampled images")
    
    with open(emb_path, 'wb') as f:
        pickle.dump(embeddings_db, f)
    
    elapsed = time.time() - t0
    print(f"[TRAINER-FAST] Done in {elapsed:.1f}s")
    return label_map

# ── OTP State (module-level, one OTP active at a time) ─────────
CURRENT_OTP      = None   # The last generated OTP (matches what was sent to Arduino)
CURRENT_OTP_TIME = None   # datetime when it was generated
OTP_TTL_SECONDS  = 120    # OTP valid window

# ── OTP Helper ─────────────────────────────────────────────────

def generate_and_send_otp(intruder_image_path=None):
    """
    Called when face recognition FAILS (unknown person at door).
    1. Generates a secure random OTP and stores it globally
    2. Emails it (with intruder photo attached) to OTP_RECIPIENT_EMAIL
    3. Sends OTP to Arduino over Serial for keypad entry
    Returns a dict: {'otp': str, 'email_sent': bool, 'email_error': str|None}
    """
    global CURRENT_OTP, CURRENT_OTP_TIME

    result = {'otp': None, 'email_sent': False, 'email_error': None}

    # --- Generate OTP ---
    otp = "".join([str(random.SystemRandom().randint(0, 9)) for _ in range(OTP_LENGTH)])
    CURRENT_OTP      = otp
    CURRENT_OTP_TIME = datetime.now()
    result['otp'] = otp
    print(f"[OTP] Generated OTP: {otp}")

    # --- Send OTP to Arduino over Serial FIRST (fastest path) ---
    if SERIAL_CONN:
        try:
            SERIAL_CONN.write(f"OTP:{otp}\n".encode("utf-8"))
            print(f"[OTP] Sent to Arduino: OTP:{otp}")
        except Exception as e:
            print(f"[OTP] Serial send failed: {e}")
    else:
        print("[OTP] No Arduino connected — OTP not sent to keypad")

    # --- Send OTP via Gmail SMTP ---
    try:
        msg = MIMEMultipart("mixed")
        msg["Subject"] = "\u26a0\ufe0f Shalimar Security — Unknown Visitor OTP"
        msg["From"]    = OTP_SENDER_EMAIL
        msg["To"]      = OTP_RECIPIENT_EMAIL

        timestamp_str = CURRENT_OTP_TIME.strftime("%Y-%m-%d %H:%M:%S")
        body = (
            f"SHALIMAR SECURITY — INTRUDER ALERT\n"
            f"===================================\n\n"
            f"Time     : {timestamp_str}\n"
            f"Status   : Unknown face detected at door\n\n"
            f"Your One-Time Password (OTP) is:\n\n"
            f"        {otp}\n\n"
            f"Enter this code on the HARDWARE KEYPAD at the door within {OTP_TTL_SECONDS} seconds\n"
            f"to grant entry to the visitor.\n\n"
            f"If you did NOT expect a visitor, ignore this email.\n"
            f"The intruder snapshot is attached if available.\n"
        )
        msg.attach(MIMEText(body, "plain"))

        # Attach intruder photo if available
        if intruder_image_path and os.path.exists(intruder_image_path):
            try:
                with open(intruder_image_path, "rb") as img_file:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(img_file.read())
                    encoders.encode_base64(part)
                    fname = os.path.basename(intruder_image_path)
                    part.add_header("Content-Disposition", f'attachment; filename="{fname}"')
                    msg.attach(part)
                print(f"[OTP] Intruder image attached: {intruder_image_path}")
            except Exception as e:
                print(f"[OTP] Could not attach image: {e}")

        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(OTP_SENDER_EMAIL, OTP_APP_PASSWORD)
            server.sendmail(OTP_SENDER_EMAIL, OTP_RECIPIENT_EMAIL, msg.as_string())

        print(f"[OTP] Email sent successfully to {OTP_RECIPIENT_EMAIL}")
        result['email_sent'] = True

    except smtplib.SMTPAuthenticationError as e:
        err_msg = "Gmail authentication failed. Regenerate App Password at https://myaccount.google.com/apppasswords"
        print(f"[OTP] EMAIL FAILED: {err_msg}")
        print(f"[OTP] Then update OTP_APP_PASSWORD in app.py (currently: {OTP_APP_PASSWORD[:4]}...)")
        result['email_error'] = err_msg
    except Exception as e:
        err_msg = f"{type(e).__name__}: {e}"
        print(f"[OTP] Email failed: {err_msg}")
        result['email_error'] = err_msg

    return result


# ── State ──────────────────────────────────────────────────────
LABEL_MAP = get_label_map()
# If LABELS_PATH didn't exist, try to build it from current dataset
if not LABEL_MAP and os.path.exists(DATASET_PATH):
    dirs = [d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))]
    if dirs:
        LABEL_MAP = {i: name for i, name in enumerate(dirs)}
        save_label_map(LABEL_MAP)
        print(f"[SYSTEM] Rebuilt label map from dataset: {LABEL_MAP}")

EMBEDDINGS_PATH = os.path.join(DATA_DIR, 'trainer', 'embeddings.pkl')
if os.path.exists(EMBEDDINGS_PATH) and LABEL_MAP:
    try:
        with open(EMBEDDINGS_PATH, 'rb') as f:
            _emb_check = pickle.load(f)
        print(f"[SYSTEM] DeepFace embeddings loaded for {len(_emb_check)} residents: {LABEL_MAP}")
    except Exception as e:
        print(f"[SYSTEM] Error loading embeddings: {e}")
else:
    print("[SYSTEM] No recognition model found or label map missing. Please register a resident.")

import base64
import io
from PIL import Image

def decode_base64_image(base64_string):
    """Converts base64 string to OpenCV image."""
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        img_data = base64.b64decode(base64_string)
        img = Image.open(io.BytesIO(img_data)).convert('RGB')
        return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    except Exception as e:
        print(f"[DECODE] Error: {e}")
        return None


# ── API Routes ──────────────────────────────────────────────────

import argon2
ph = argon2.PasswordHasher()

@app.route('/api/auth/register', methods=['POST'])
def register_password():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"success": False, "error": "Missing username or password"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "error": "Username already taken"}), 409
    
    hashed = ph.hash(password)
    user = User(username=username, password_hash=hashed)
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({"success": True, "token": access_token})

@app.route('/api/auth/login', methods=['POST'])
def login_password():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"success": False, "error": "Invalid credentials"}), 401
    
    try:
        ph.verify(user.password_hash, password)
        if ph.check_needs_rehash(user.password_hash):
            user.password_hash = ph.hash(password)
            db.session.commit()
    except argon2.exceptions.VerifyMismatchError:
        return jsonify({"success": False, "error": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=user.id)
    return jsonify({"success": True, "token": access_token})

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    """ Returns current user profile and biometric status. """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
        
    biometric = Biometric.query.filter_by(user_id=user.id).first()
    return jsonify({
        "success": True, 
        "user": {
            "id": user.id,
            "username": user.username
        },
        "has_biometric": biometric is not None
    })

@app.route('/api/auth/has-residents', methods=['GET'])
def has_residents_api():
    """ Helper for the frontend to check if first-time setup is needed. """
    count = User.query.count()
    return jsonify({"has_residents": count > 0})

# DeepFace is imported at the top of the file

def extract_face_embedding(image_data, return_numpy=False):
    """
    Extracts a 128D face embedding (Facenet model by default) using DeepFace.
    Returns bytes by default, or numpy array if return_numpy=True.
    Returns None if no face is detected or extraction fails.
    
    NOTE: DeepFace on Windows crashes with OSError when passed numpy arrays
    inside Flask's request context. We work around this by saving to a temp
    file (with UUID name to prevent collision in multi-threaded server) and
    passing the file path instead.
    
    We use enforce_detection=False directly for reliability — this handles
    partial/angled/low-light faces without failing. The L2-normalized FaceNet
    embedding quality is consistent regardless of this flag.
    """
    import tempfile, uuid
    tmp_path = None
    try:
        if isinstance(image_data, str):
            img_arr = decode_base64_image(image_data)
            if img_arr is None:
                print("[EMBED] Failed to decode base64 image")
                return None
        else:
            img_arr = image_data

        if img_arr is None or img_arr.size == 0:
            print("[EMBED] Empty image array received")
            return None

        # UUID-based filename prevents collision in multi-threaded server
        tmp_path = os.path.join(tempfile.gettempdir(), f"df_embed_{uuid.uuid4().hex}.jpg")
        cv2.imwrite(tmp_path, img_arr)

        if not os.path.exists(tmp_path):
            print("[EMBED] Failed to write temp file")
            return None

        # Use enforce_detection=False for robustness (handles partial/angled faces,
        # poor lighting, and glasses). FaceNet embeddings remain high quality.
        results = DeepFace.represent(img_path=tmp_path, model_name='Facenet', enforce_detection=False)

        if results and len(results) > 0:
            embedding = np.array(results[0]["embedding"], dtype=np.float32)
            # Sanity check — reject zero/near-zero embeddings (no face present)
            if np.linalg.norm(embedding) < 1e-6:
                print("[EMBED] Received near-zero embedding — no face detected")
                return None
            # L2 normalize for consistent cosine similarity
            norm = np.linalg.norm(embedding)
            embedding = embedding / norm
            if return_numpy:
                return embedding
            return embedding.tobytes()

        print("[EMBED] DeepFace returned no results")
        return None
    except Exception as e:
        print(f"[EMBED] Error extracting embedding: {type(e).__name__}: {e}")
        return None
    finally:
        # Always clean up temp file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass

@app.route('/api/face/attach', methods=['POST'])
@jwt_required()
def attach_face():
    # Attach face template to logged in user
    user_id = get_jwt_identity()
    data = request.json
    password_proof = data.get('password_proof')
    consent = data.get('consent', False)
    images = data.get('images', [])

    if not password_proof or not consent or not images:
        return jsonify({'success': False, 'error': 'Missing password, consent, or images.'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found.'}), 404

    try:
        ph.verify(user.password_hash, password_proof)
    except argon2.exceptions.VerifyMismatchError:
        return jsonify({'success': False, 'error': 'Invalid password proof.'}), 403

    # Extract embedding from the best image (middle frame)
    best_idx = len(images) // 2
    raw_embedding = extract_face_embedding(images[best_idx])
    if raw_embedding is None:
        return jsonify({'success': False, 'error': 'No face detected in image. Please try again with better lighting.'}), 400
    
    # Encrypt the template
    encrypted_template, nonce, encrypted_dek = encrypt_face_template(raw_embedding)

    biometric = Biometric(
        user_id=user.id,
        encrypted_template=encrypted_template,
        encrypted_dek=encrypted_dek,
        nonce=nonce,
        is_guest=False
    )
    db.session.add(biometric)
    db.session.commit()

    return jsonify({'success': True, 'status': 'face_attached'})

@app.route('/api/face/guest_register', methods=['POST'])
def guest_register():
    data = request.json
    consent = data.get('consent', False)
    images = data.get('images', [])

    if not consent or not images:
        return jsonify({'success': False, 'error': 'Consent and images required.'}), 400

    raw_embedding = extract_face_embedding(images[len(images) // 2])
    if raw_embedding is None:
        return jsonify({'success': False, 'error': 'No face detected. Try again with better lighting.'}), 400
    encrypted_template, nonce, encrypted_dek = encrypt_face_template(raw_embedding)

    from datetime import timedelta
    biometric = Biometric(
        user_id=None,
        encrypted_template=encrypted_template,
        encrypted_dek=encrypted_dek,
        nonce=nonce,
        is_guest=True
    )
    db.session.add(biometric)
    db.session.commit()

    # Issue a guest token valid for 24h
    guest_token = create_access_token(identity=f"guest_{biometric.id}", expires_delta=timedelta(hours=24))
    return jsonify({'success': True, 'guest_token': guest_token}), 201

@app.route('/api/face/revoke', methods=['DELETE'])
@jwt_required()
def revoke_face():
    """ Permanently deletes the logged-in user's biometric data. """
    user_id = get_jwt_identity()
    biometric = Biometric.query.filter_by(user_id=user_id).first()
    
    if not biometric:
        return jsonify({'success': False, 'error': 'No biometric data found for this user.'}), 404
        
    db.session.delete(biometric)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Biometric data revoked successfully.'})

@app.route('/api/face/authenticate', methods=['POST'])
def authenticate_face():
    """ 
    Performs 1:N biometric matching against all stored templates.
    Decrypts templates and uses Cosine Similarity.
    """
    # Use get_data() + json.loads() to avoid Werkzeug SpooledTemporaryFile
    # OSError [Errno 22] on Windows with large base64 payloads
    data = _json.loads(request.get_data(cache=False))
    images = data.get('images', [])
    if not images:
        return jsonify({'success': False, 'error': 'No images provided.'}), 400

    # 1. Extract embedding from current face (use multiple frames for robustness)
    try:
        embeddings = []
        for img in images:
            emb = extract_face_embedding(img, return_numpy=True)
            if emb is not None:
                embeddings.append(emb)
        
        if not embeddings:
            return jsonify({'success': False, 'error': 'No face detected in any frame. Please face the camera directly.'}), 400
        
        # Average multiple embeddings for noise reduction
        current_embedding = np.mean(embeddings, axis=0).astype(np.float32)
        # Re-normalize after averaging
        norm = np.linalg.norm(current_embedding)
        if norm > 0:
            current_embedding = current_embedding / norm
        
        print(f"[AUTH-DB] Extracted {len(embeddings)}/{len(images)} valid embeddings")
    except Exception as e:
        return jsonify({'success': False, 'error': f'Embedding extraction failed: {str(e)}'}), 500

    # 2. Fetch all persistent biometric templates
    all_biometrics = Biometric.query.all()
    best_match_user = None
    max_similarity = -1.0
    similarity_threshold = 0.55  # Lowered for FaceNet L2-normalized embeddings

    print(f"[AUTH-DB] Comparing against {len(all_biometrics)} stored biometrics")

    for bio in all_biometrics:
        try:
            # 3. Decrypt the stored template
            raw_stored_bytes = decrypt_face_template(bio.encrypted_template, bio.nonce, bio.encrypted_dek)
            stored_embedding = np.frombuffer(raw_stored_bytes, dtype=np.float32)
            
            # 4. Compute Cosine Similarity (embeddings are already L2-normalized)
            norm_stored = np.linalg.norm(stored_embedding)
            if norm_stored > 0:
                stored_embedding = stored_embedding / norm_stored
            
            similarity = float(np.dot(current_embedding, stored_embedding))
            
            bio_label = bio.user.username if bio.user else f"Guest_{bio.id[:8]}"
            print(f"[AUTH-DB] Similarity with {bio_label}: {similarity:.4f}")
            
            if similarity > max_similarity:
                max_similarity = similarity
                if similarity > similarity_threshold:
                    if bio.user:
                        best_match_user = bio.user
                    elif bio.is_guest:
                        best_match_user = f"Guest_{bio.id[:8]}"
        except Exception as e:
            print(f"[AUTH-DB] Error processing biometric ID {bio.id}: {e}")
            continue
    
    print(f"[AUTH-DB] Best similarity: {max_similarity:.4f}, Match: {best_match_user}")

    if best_match_user:
        if isinstance(best_match_user, str):
            # Guest match
            log_access(best_match_user, 'granted', round(float(max_similarity) * 100, 1))
            return jsonify({'success': True, 'name': best_match_user, 'role': 'guest', 'confidence': round(float(max_similarity) * 100, 1)})
        else:
            # Resident match
            access_token = create_access_token(identity=best_match_user.id)
            safe_serial_write(b"OPEN\n")
            log_access(best_match_user.username, 'granted', round(float(max_similarity) * 100, 1))
            return jsonify({'success': True, 'token': access_token, 'name': best_match_user.username, 'role': 'resident', 'confidence': round(float(max_similarity) * 100, 1)})

    # Face not recognised — save intruder snapshot, then trigger OTP flow
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    intruder_path = os.path.join(INTRUDERS_PATH, f"intruder_{timestamp}.jpg")
    intruder_img = decode_base64_image(images[-1])
    if intruder_img is not None:
        cv2.imwrite(intruder_path, intruder_img)
    else:
        intruder_path = None
    log_access('Unknown', 'otp_sent', round(float(max_similarity) * 100, 1) if max_similarity > -1 else None)
    threading.Thread(target=generate_and_send_otp, args=(intruder_path,), daemon=True).start()
    return jsonify({'success': False, 'error': 'Identity unknown. OTP sent to registered email. Enter it on the hardware keypad.'}), 401



@app.route('/register', methods=['POST'])
@app.route('/api/register', methods=['POST'])  # alias for React frontend
def register():
    """Receives a list of images for a new resident and triggers training."""
    # Use get_data() + json.loads() to avoid Werkzeug SpooledTemporaryFile
    # OSError [Errno 22] on Windows with large base64 payloads
    data = _json.loads(request.get_data(cache=False))
    name = data.get('name', 'Unknown').strip()
    images_base64 = data.get('images', [])
    
    print(f"[REGISTER] Received registration request for: {name} ({len(images_base64)} images)", flush=True)
    
    if not images_base64:
        return jsonify({'success': False, 'error': 'No images provided'}), 400
        
    # --- Check for Duplicate Face ---
    emb_path = os.path.join(DATA_DIR, 'trainer', 'embeddings.pkl')
    if os.path.exists(emb_path):
        try:
            with open(emb_path, 'rb') as f:
                embeddings_db = pickle.load(f)
            
            best_frame_idx = len(images_base64) // 2
            current_embedding_bytes = extract_face_embedding(images_base64[best_frame_idx])
            
            # Guard against None — no face detected in the middle frame
            if current_embedding_bytes is not None:
                current_embedding = np.frombuffer(current_embedding_bytes, dtype=np.float32)
                
                for label_id, db_emb in embeddings_db.items():
                    norm_curr = np.linalg.norm(current_embedding)
                    norm_db = np.linalg.norm(db_emb)
                    if norm_curr > 0 and norm_db > 0:
                        similarity = np.dot(current_embedding, db_emb) / (norm_curr * norm_db)
                        print(f"[REGISTER] Similarity with {label_id}: {similarity:.4f}")
                        if similarity > 0.60: # Facenet match threshold
                            existing_name = get_label_map().get(label_id, "an existing resident")
                            return jsonify({'success': False, 'error': f'Face already registered to {existing_name}!'}), 400
            else:
                print("[REGISTER] Could not extract embedding for duplicate check — skipping (will validate during training)")
        except Exception as e:
            print(f"[REGISTER] Duplicate face check error: {e}")
        
    person_path = os.path.join(DATASET_PATH, name)
    if not os.path.exists(person_path):
        os.makedirs(person_path)
    
    count = 0
    for i, img_b64 in enumerate(images_base64):
        frame = decode_base64_image(img_b64)
        if frame is None: 
            print(f"[REGISTER] Frame {i} decode failed.")
            continue
        
        # Save raw, high-resolution color frame for DeepFace processing
        count += 1
        cv2.imwrite(os.path.join(person_path, f"{count}.jpg"), frame)
        if count >= 10: break
    
    print(f"[REGISTER] Processed {len(images_base64)} images. Saved {count} full-color samples for DeepFace.")

    if count < 5:
        return jsonify({
            'success': False, 
            'error': f'Only {count} frames captured successfully. Please try again.'
        }), 400

    global LABEL_MAP
    LABEL_MAP = train_single_resident(name.strip())
    
    return jsonify({'success': True, 'message': f'Resident {name} registered successfully.'})

@app.route('/recognize', methods=['POST'])
def recognize_face():
    """Recognizes a face using High-Precision DeepFace Embeddings with multi-frame averaging."""
    print("[RECOGNIZE] Request received", flush=True)
    try:
        # Use get_data() + json.loads() to avoid Werkzeug SpooledTemporaryFile
        # OSError [Errno 22] on Windows with large base64 payloads
        data = _json.loads(request.get_data(cache=False))
        images_b64 = data.get('images', [])
        if not images_b64:
            single = data.get('image')
            images_b64 = [single] if single else []
            
        if not images_b64:
            return jsonify({'success': False, 'error': 'No image data provided'}), 400

        emb_path = os.path.join(DATA_DIR, 'trainer', 'embeddings.pkl')
        if not os.path.exists(emb_path):
            return jsonify({'success': False, 'error': 'Recognition model not trained. Please register a resident first.'}), 503

        with open(emb_path, 'rb') as f:
            embeddings_db = pickle.load(f)

        if not embeddings_db:
            return jsonify({'success': False, 'error': 'No residents registered yet.'}), 503

        # Always reload label map fresh — avoids stale in-memory state after training
        current_label_map = get_label_map()
        if not current_label_map:
            return jsonify({'success': False, 'error': 'Label map missing. Please retrain.'}), 503

        # ── Best-of-N matching across ALL frames ─────────────────────────
        # Strategy: extract embeddings from ALL frames independently, then
        # compare EACH embedding against EVERY stored resident.
        # The highest single similarity score across all frame×resident pairs
        # wins. This means ONE good frame is enough — bad frames can't drag
        # the score down (unlike averaging).
        n = len(images_b64)

        # Extract from all frames (skip duplicates at same index)
        all_frame_embeddings = []
        for idx in range(n):
            emb = extract_face_embedding(images_b64[idx], return_numpy=True)
            if emb is not None:
                all_frame_embeddings.append(emb)

        if not all_frame_embeddings:
            print("[RECOGNIZE] No face detected in any frame", flush=True)
            return jsonify({'success': False, 'error': 'No face detected. Please face the camera directly with good lighting.'}), 400

        print(f"[RECOGNIZE] Got {len(all_frame_embeddings)}/{n} valid frame embeddings", flush=True)

        best_match_name = None
        best_match_id   = None
        max_similarity  = -1.0
        # Threshold: 0.42 is permissive enough for real-world lighting variation
        # while still rejecting strangers (typical inter-person score < 0.30)
        MATCH_THRESHOLD = 0.42

        for label_id, db_emb in embeddings_db.items():
            db_emb_arr  = np.array(db_emb, dtype=np.float32)
            db_emb_norm = np.linalg.norm(db_emb_arr)
            if db_emb_norm < 1e-6:
                print(f"[RECOGNIZE] Skipping label_id={label_id} — zero-norm stored embedding")
                continue
            db_emb_normalized = db_emb_arr / db_emb_norm

            resident_name = current_label_map.get(label_id, current_label_map.get(str(label_id), f"ID:{label_id}"))

            # Best score across ALL frames for this resident
            best_for_resident = max(
                float(np.dot(frame_emb, db_emb_normalized))
                for frame_emb in all_frame_embeddings
            )
            print(f"[RECOGNIZE] {resident_name} (id={label_id}) -> best-frame similarity: {best_for_resident:.4f}")

            if best_for_resident > max_similarity:
                max_similarity = best_for_resident
                if best_for_resident >= MATCH_THRESHOLD:
                    best_match_name = resident_name
                    best_match_id   = label_id

        print(f"[RECOGNIZE] Best: {best_match_name} @ {max_similarity:.4f} (threshold={MATCH_THRESHOLD})", flush=True)
        
        if best_match_name:
            confidence_pct = round(max_similarity * 100, 1)
            print(f"[DOOR] Recognized: {best_match_name} ({confidence_pct}%). Sending OPEN to Arduino...", flush=True)
            safe_serial_write(b"OPEN\n")
            log_access(best_match_name, 'granted', confidence_pct)
            return jsonify({'success': True, 'name': best_match_name, 'confidence': confidence_pct})
        
        # Unknown face — save intruder snapshot, send OTP to email + Arduino
        print(f"[RECOGNIZE] No match (best similarity {max_similarity:.4f} < {MATCH_THRESHOLD})", flush=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        intruder_path = os.path.join(INTRUDERS_PATH, f"intruder_{timestamp}.jpg")
        raw_img = decode_base64_image(images_b64[-1])
        if raw_img is not None:
            cv2.imwrite(intruder_path, raw_img)
            print(f"[INTRUDER] Snapshot saved: {intruder_path}", flush=True)
        else:
            intruder_path = None
        log_access('Unknown', 'otp_sent', round(max_similarity * 100, 1) if max_similarity > -1 else None)
        # Send OTP synchronously so we can report email status to the frontend
        otp_result = generate_and_send_otp(intruder_image_path=intruder_path)
        email_status = 'OTP emailed successfully.' if otp_result.get('email_sent') else f"OTP generated but email failed: {otp_result.get('email_error', 'unknown error')}"
        return jsonify({
            'success': False,
            'error': f'Identity unknown (best similarity: {max_similarity:.4f}). {email_status}',
            'otp_email_sent': otp_result.get('email_sent', False),
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Server error: {type(e).__name__}: {str(e)}'}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    Optional endpoint for a web UI to verify the OTP.
    Note: The primary OTP entry is meant for the Arduino keypad.
    """
    global CURRENT_OTP, CURRENT_OTP_TIME
    
    data = request.json
    user_otp = data.get('otp', '').strip()
    
    if not CURRENT_OTP:
        return jsonify({'success': False, 'error': 'No active OTP session.'}), 400
        
    # Check expiry
    elapsed = (datetime.now() - CURRENT_OTP_TIME).total_seconds()
    if elapsed > OTP_TTL_SECONDS:
        CURRENT_OTP = None
        return jsonify({'success': False, 'error': 'OTP has expired.'}), 400
        
    if user_otp == CURRENT_OTP:
        CURRENT_OTP = None # Consume it
        safe_serial_write(b"OPEN\n")
        return jsonify({'success': True, 'message': 'OTP verified successfully. Door opened.'})
    else:
        return jsonify({'success': False, 'error': 'Invalid OTP.'}), 400

@app.route('/intruders', methods=['GET'])
def get_intruders():
    """Returns a list of logged intruder attempts."""
    try:
        files = sorted(os.listdir(INTRUDERS_PATH), reverse=True)
        intruders = []
        for f in files:
            if f.endswith('.jpg'):
                parts = f.replace('intruder_', '').replace('.jpg', '').split('_')
                if len(parts) >= 2:
                    date_str = f"{parts[0][0:4]}-{parts[0][4:6]}-{parts[0][6:8]} {parts[1][0:2]}:{parts[1][2:4]}:{parts[1][4:6]}"
                    intruders.append({
                        'id': f,
                        'url': f'/intruder_images/{f}',
                        'timestamp': date_str
                    })
        return jsonify({'success': True, 'intruders': intruders})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/intruder_images/<path:filename>')
def serve_intruder_image(filename):
    return send_from_directory(INTRUDERS_PATH, filename)

@app.route('/intruders/<path:filename>', methods=['DELETE'])
def delete_intruder(filename):
    try:
        file_path = os.path.join(INTRUDERS_PATH, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({'success': True, 'message': f'File {filename} deleted.'})
        else:
            return jsonify({'success': False, 'error': 'File not found.'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/users', methods=['GET'])
def get_users():
    """Returns the list of registered residents based on the dataset."""
    label_map = get_label_map()
    return jsonify(list(set(label_map.values())))

@app.route('/api/residents/delete', methods=['POST'])
def delete_resident():
    """
    Deletes a resident's face dataset + removes from labels.json + retrains.
    Body: {"name": "Resident Name", "password": "admin123"}
    Uses POST (not DELETE) to avoid Flask catch-all routing conflicts.
    """
    global LABEL_MAP
    try:
        data = _json.loads(request.get_data(cache=False) or b'{}')
        password = data.get('password', '')
        name = data.get('name', '').strip()
        ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
        if password != ADMIN_PASSWORD:
            return jsonify({'success': False, 'error': 'Invalid admin password'}), 403

        if not name:
            return jsonify({'success': False, 'error': 'Resident name is required'}), 400

        # 1. Delete dataset folder
        person_path = os.path.join(DATASET_PATH, name)
        if os.path.exists(person_path):
            import shutil
            shutil.rmtree(person_path)
            print(f"[DELETE] Removed dataset folder: {person_path}", flush=True)
        else:
            print(f"[DELETE] Dataset folder not found (already gone?): {person_path}", flush=True)

        # 2. Remove from labels.json and re-index cleanly
        label_map = get_label_map()
        remaining_names = [n for n in label_map.values() if n != name]
        new_label_map = {i: n for i, n in enumerate(remaining_names)}
        save_label_map(new_label_map)
        print(f"[DELETE] Updated labels.json: {new_label_map}", flush=True)

        # 3. Remove from embeddings.pkl
        emb_path = os.path.join(DATA_DIR, 'trainer', 'embeddings.pkl')
        if os.path.exists(emb_path):
            with open(emb_path, 'rb') as f:
                embeddings_db = pickle.load(f)
            new_embeddings = {new_id: embeddings_db[old_id]
                              for new_id, new_name in new_label_map.items()
                              for old_id, old_name in label_map.items()
                              if old_name == new_name and old_id in embeddings_db}
            with open(emb_path, 'wb') as f:
                pickle.dump(new_embeddings, f)
            print(f"[DELETE] Updated embeddings.pkl: {len(new_embeddings)} residents", flush=True)

        # 4. Full retrain for consistency
        LABEL_MAP = train_model()

        return jsonify({
            'success': True,
            'message': f'Resident "{name}" deleted and model retrained. {len(LABEL_MAP)} residents remaining.'
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'{type(e).__name__}: {str(e)}'}), 500

@app.route('/has-residents', methods=['GET'])
def has_residents():
    """Returns whether any residents have been registered (dataset has at least one face folder)."""
    if not os.path.exists(DATASET_PATH):
        return jsonify({'has_residents': False})
    dirs = [d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))]
    return jsonify({'has_residents': len(dirs) > 0})

@app.route('/health', methods=['GET'])
def health():
    emb_exists = os.path.exists(os.path.join(DATA_DIR, 'trainer', 'embeddings.pkl'))
    return jsonify({'status': 'ok', 'model_ready': emb_exists})

@app.route('/retrain', methods=['POST'])
def retrain():
    """Re-extracts and L2-normalizes all embeddings from the dataset. Use after fixing recognition issues."""
    global LABEL_MAP
    try:
        LABEL_MAP = train_model()
        return jsonify({'success': True, 'message': f'Retrained {len(LABEL_MAP)} residents with L2-normalized embeddings.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/test-email', methods=['GET'])
def test_email():
    """Diagnostic endpoint: tests SMTP credentials without a face scan."""
    try:
        import smtplib
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(OTP_SENDER_EMAIL, OTP_APP_PASSWORD)
        return jsonify({'success': True, 'message': f'SMTP login OK for {OTP_SENDER_EMAIL}'})
    except smtplib.SMTPAuthenticationError as e:
        return jsonify({'success': False, 'error': f'Auth failed: {e}. Regenerate Gmail App Password at https://myaccount.google.com/apppasswords'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/test-otp', methods=['POST'])
def test_otp():
    """Diagnostic endpoint: sends a real OTP email + Arduino serial, returns OTP for verification."""
    result = generate_and_send_otp(intruder_image_path=None)
    otp_code = result.get('otp', '????')
    email_ok = result.get('email_sent', False)
    return jsonify({
        'success': email_ok,
        'otp': otp_code,
        'email_sent': email_ok,
        'email_error': result.get('email_error'),
        'message': f'OTP {otp_code} {"sent" if email_ok else "generated (email failed)"} to {OTP_RECIPIENT_EMAIL}'
    })

# ── Dashboard API Endpoints ────────────────────────────────────

@app.route('/api/access-log', methods=['GET'])
def get_access_log():
    """Returns the most recent access events for the dashboard feed."""
    limit = min(int(request.args.get('limit', 50)), 200)
    logs = AccessLog.query.order_by(AccessLog.timestamp.desc()).limit(limit).all()
    return jsonify({'success': True, 'logs': [l.to_dict() for l in logs]})

@app.route('/api/access-stats', methods=['GET'])
def get_access_stats():
    """Returns aggregated counts for the dashboard stat cards."""
    from datetime import timedelta
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_today  = AccessLog.query.filter(AccessLog.timestamp >= today_start).count()
    granted_today = AccessLog.query.filter(
        AccessLog.timestamp >= today_start,
        AccessLog.event_type == 'granted'
    ).count()
    denied_today = AccessLog.query.filter(
        AccessLog.timestamp >= today_start,
        AccessLog.event_type.in_(['denied', 'otp_sent'])
    ).count()
    # Count from dataset folder (face-enrolled) + fallback to DB users
    label_map = get_label_map()
    face_resident_count = len(label_map) if label_map else 0
    db_user_count = User.query.count()
    total_residents = max(face_resident_count, db_user_count)
    print(f"[DEBUG] get_access_stats: face_resident_count={face_resident_count}, db_user_count={db_user_count}, total={total_residents}")
    emb_exists = os.path.exists(os.path.join(DATA_DIR, 'trainer', 'embeddings.pkl'))

    return jsonify({
        'success': True,
        'stats': {
            'total_today':      total_today,
            'granted_today':    granted_today,
            'denied_today':     denied_today,
            'total_residents':  total_residents,
            'model_ready':      emb_exists,
            'serial_connected': SERIAL_CONN is not None,
        }
    })

@app.route('/api/door/unlock', methods=['POST'])
def manual_unlock():
    """Admin-triggered remote door unlock (requires admin password)."""
    data = request.json or {}
    password = data.get('password', '')
    # Simple server-side password check (use env var in production)
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
    if password != ADMIN_PASSWORD:
        return jsonify({'success': False, 'error': 'Invalid admin password'}), 403
    safe_serial_write(b"OPEN\n")
    log_access('Admin', 'granted', method='manual')
    return jsonify({'success': True, 'message': 'Door unlocked remotely'})

@app.route('/api/door/lock', methods=['POST'])
def manual_lock():
    """Admin-triggered remote door lock."""
    data = request.json or {}
    password = data.get('password', '')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
    if password != ADMIN_PASSWORD:
        return jsonify({'success': False, 'error': 'Invalid admin password'}), 403
    safe_serial_write(b"LOCK\n")
    return jsonify({'success': True, 'message': 'Lock command sent to Arduino'})

# ── Static / React SPA Routes (must be LAST so API routes match first) ──
from flask import redirect

@app.route('/')
def serve():
    """Redirect to the Vite dev server."""
    return redirect("http://localhost:5173/")

@app.route('/<path:path>', methods=['GET'])
def serve_static(path):
    """Redirect all non-API GET paths to Vite dev server."""
    api_prefixes = ('api/', 'recognize', 'intruders', 'users', 'health', 'verify-otp', 'intruder_images/', 'has-residents', 'retrain', 'test-')
    if path.startswith(api_prefixes):
        from flask import abort
        abort(404)
    return redirect(f"http://localhost:5173/{path}")

def open_browser():
    """Wait for server to start, then open browser to Vite frontend."""
    import time, webbrowser
    time.sleep(1.5)
    webbrowser.open("http://localhost:5173/")

if __name__ == '__main__':
    import os
    if not os.environ.get("WERKZEUG_RUN_MAIN"):
        import threading
        threading.Thread(target=open_browser).start()
    print("\n" + "="*50, flush=True)
    print("SERVER IS FULLY LOADED AND READY!", flush=True)
    print("Go to http://localhost:5173/auth and scan your face.", flush=True)
    print("="*50 + "\n", flush=True)
    # Use waitress instead of Werkzeug dev server — Werkzeug has a socket bug
    # on Windows that causes OSError [Errno 22] with large JSON payloads (>16KB)
    try:
        from waitress import serve
        print("[SERVER] Using waitress WSGI server (Windows-safe)", flush=True)
        serve(app, host='0.0.0.0', port=5000, threads=4)
    except ImportError:
        print("[SERVER] waitress not found, falling back to Werkzeug", flush=True)
        print("[SERVER] WARNING: Large image payloads may fail on Windows!", flush=True)
        app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
