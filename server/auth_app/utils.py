import pyotp
import qrcode
import base64
from io import BytesIO


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
