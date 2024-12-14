import os, jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import padding, serialization
from cryptography.hazmat.primitives import hashes
from django.utils import timezone
from datetime import timedelta


def get_server_key():
    key = os.environ.get("SERVER_ENCRYPTION_KEY")

    if not key:
        raise ValueError("SERVER_ENCRYPTION_KEY is not set!")

    return key.encode("utf-8")


def encrypt_data(data: bytes) -> tuple[bytes, bytes]:
    key = get_server_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    encrypted = aesgcm.encrypt(nonce, data, None)

    return (nonce, encrypted)


def decrypt_data(nonce: bytes, encrypted_data: bytes) -> bytes:
    key = get_server_key()
    aesgcm = AESGCM(key)

    return aesgcm.decrypt(nonce, encrypted_data, None)


def encrypt_with_public_key(public_key_pem: bytes, data: bytes) -> bytes:
    public_key = serialization.load_pem_public_key(public_key_pem)
    encrypted_data = public_key.encrypt(
        data,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )

    return encrypted_data


def generate_share_jwt(file_id: int):
    secret_key = os.environ.get("AUTH_JWT_SECRET_KEY")
    exp = timezone.now() + timedelta(minutes=30)
    payload = {"file_id": file_id, "exp": exp.timestamp()}
    token = jwt.encode(payload, secret_key, algorithm="HS256")

    return token
