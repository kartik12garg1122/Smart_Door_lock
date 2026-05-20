import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Simulated KMS Master Key (In production, load this from secure env or actual KMS)
# Using a fixed 32-byte key for demonstration since it requires persistence across restarts
_env_key = os.environ.get('MASTER_KMS_KEY')
if _env_key:
    # Env var is a string — encode to bytes, pad/truncate to exactly 32 bytes
    _MASTER_KEY = _env_key.encode('utf-8')[:32].ljust(32, b'\0')
else:
    _MASTER_KEY = b'secure_default_master_key_32byte'  # exactly 32 bytes

def kms_encrypt_dek(dek: bytes) -> bytes:
    """Mock KMS call to encrypt the Data Encryption Key."""
    aesgcm = AESGCM(_MASTER_KEY)
    nonce = os.urandom(12)
    return nonce + aesgcm.encrypt(nonce, dek, b"kms_envelope")

def kms_decrypt_dek(encrypted_dek: bytes) -> bytes:
    """Mock KMS call to decrypt the Data Encryption Key."""
    aesgcm = AESGCM(_MASTER_KEY)
    nonce = encrypted_dek[:12]
    ciphertext = encrypted_dek[12:]
    return aesgcm.decrypt(nonce, ciphertext, b"kms_envelope")

def encrypt_face_template(raw_template_bytes: bytes):
    """
    Encrypts a face template using AES-GCM envelope encryption.
    Returns (encrypted_template, nonce, encrypted_dek)
    """
    # 1. Generate unique DEK
    dek = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(dek)
    nonce = os.urandom(12)
    
    # 2. Encrypt template
    encrypted_template = aesgcm.encrypt(nonce, raw_template_bytes, b"face_template_data")
    
    # 3. Encrypt the DEK using KMS
    encrypted_dek = kms_encrypt_dek(dek)
    
    return encrypted_template, nonce, encrypted_dek

def decrypt_face_template(encrypted_template: bytes, nonce: bytes, encrypted_dek: bytes) -> bytes:
    """
    Decrypts the envelope encrypted face template.
    """
    # 1. Decrypt DEK
    dek = kms_decrypt_dek(encrypted_dek)
    aesgcm = AESGCM(dek)
    
    # 2. Decrypt template
    raw_template_bytes = aesgcm.decrypt(nonce, encrypted_template, b"face_template_data")
    return raw_template_bytes
