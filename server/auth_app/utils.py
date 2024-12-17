import pyotp, qrcode, base64, os, jwt
from io import BytesIO

from django.utils import timezone
from django.conf import settings

from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


def get_server_key():
    key = os.environ.get("SECRET_KEY")
    return key.encode("utf-8")


def generate_rsa_key_pair():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=4096)
    public_key = private_key.public_key()
    return private_key, public_key


def derive_key_from_master_password(master_password, salt):
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=100000)
    return kdf.derive(master_password.encode("utf-8"))


def encrypt_private_key(private_key, master_password):
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    salt = os.urandom(16)
    derived_key = derive_key_from_master_password(master_password, salt)
    aesgcm = AESGCM(derived_key)
    nonce = os.urandom(12)
    encrypted = aesgcm.encrypt(nonce, pem, None)
    return salt + nonce + encrypted


def decrypt_private_key(encrypted_private_key, master_password):
    salt = encrypted_private_key[:16]
    nonce = encrypted_private_key[16:28]
    ciphertext = encrypted_private_key[28:]
    derived_key = derive_key_from_master_password(master_password, salt)
    aesgcm = AESGCM(derived_key)
    pem = aesgcm.decrypt(nonce, ciphertext, None)
    private_key = serialization.load_pem_private_key(pem, password=None)
    return private_key


def generate_mfa_secret():
    return pyotp.random_base32()


def generate_mfa_temp_token(user_id) -> tuple[str, str]:
    secret_key = os.environ.get("MFA_JWT_SECRET_KEY")
    exp = timezone.now() + timezone.timedelta(
        minutes=settings.MFA_TOKEN_TIME_LIMIT_IN_MINS
    )
    payload = {"user_id": user_id, "purpose": "mfa_auth", "exp": exp.timestamp()}
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token, exp.isoformat()


def decode_mfa_temp_token(token):
    secret_key = os.environ.get("MFA_JWT_SECRET_KEY")
    payload = jwt.decode(token, secret_key, algorithms=["HS256"])
    if payload.get("purpose") != "mfa_auth":
        raise jwt.InvalidTokenError("Not a MFA token")
    return payload


def verify_totp(token, secret):
    totp = pyotp.TOTP(secret)
    return totp.verify(token)


def generate_totp_uri(secret, email, issuer="FShare"):
    return f"otpauth://totp/{issuer}:{email}?secret={secret}&issuer={issuer}"


def generate_qr_code_image_uri(totp_uri: str) -> str:
    img = qrcode.make(totp_uri)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"


def encrypt_mfa_secret(mfa_secret: str) -> str:
    backend = default_backend()
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(get_server_key()), modes.CFB(iv), backend=backend)
    encryptor = cipher.encryptor()
    encrypted_data = encryptor.update(mfa_secret.encode()) + encryptor.finalize()

    return base64.b64encode(iv + encrypted_data).decode("utf-8")


def decrypt_mfa_secret(encrypted_secret: str) -> str:
    backend = default_backend()
    data = base64.b64decode(encrypted_secret)
    iv = data[:16]
    encrypted_data = data[16:]
    cipher = Cipher(algorithms.AES(get_server_key()), modes.CFB(iv), backend=backend)
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()

    return decrypted_data.decode("utf-8")


def get_formatted_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }
