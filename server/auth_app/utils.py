import pyotp
import qrcode
import base64
from io import BytesIO
import os
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


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


def verify_totp(token, secret):
    totp = pyotp.TOTP(secret)
    return totp.verify(token)


def generate_totp_uri(secret, email, issuer="MySecureApp"):
    return f"otpauth://totp/{issuer}:{email}?secret={secret}&issuer={issuer}"


def generate_qr_code_image_uri(totp_uri):
    img = qrcode.make(totp_uri)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"
