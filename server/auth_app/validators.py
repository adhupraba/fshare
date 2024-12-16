import re
from re import RegexFlag
from rest_framework import serializers


def validate_name(name: str):
    if not name:
        raise serializers.ValidationError("Name is required.")
    if len(name) > 255:
        raise serializers.ValidationError("Name cannot exceed 255 characters.")
    if not re.match(
        r"^(?:[A-Za-z]{2,}(?: [A-Za-z]{1,})*|[A-Za-z]{1,}(?: [A-Za-z]{1,})*)$", name
    ):
        raise serializers.ValidationError("Name must contain only alphabets.")
    return name


def validate_username(username: str):
    # 5-20 chars, alphanumeric and underscore allowed
    if not username:
        raise serializers.ValidationError("Username is required.")
    if not re.match(r"^[A-Za-z0-9_]{5,20}$", username):
        raise serializers.ValidationError(
            "Username must be 5-20 characters, alphanumeric with underscores allowed."
        )
    return username


def validate_email(email: str):
    if not email:
        raise serializers.ValidationError("Email is required.")
    if not re.match(
        r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email, RegexFlag.IGNORECASE
    ):
        raise serializers.ValidationError("Email must be valid.")


def match_password_regex(password: str):
    return re.match(
        r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?:{}|<>])[A-Za-z\d!@#$%^&*(),.?:{}|<>]{5,20}$",
        password,
    )


def validate_password(password: str):
    """
    constraints for password:
    - atleast one lower case character
    - alteast one upper case character
    - atleast one number
    - atleast one special character from !@#$%^&*(),.?:{}|<>
    - 5 to 20 characters
    """
    if not password:
        raise serializers.ValidationError("Password is required.")
    if not match_password_regex(password):
        raise serializers.ValidationError(
            "Password does not match the given constraints."
        )
    return password


def validate_master_password(master_password: str):
    """
    constraints for master password:
    - atleast one lower case character
    - alteast one upper case character
    - atleast one number
    - atleast one special character from !@#$%^&*(),.?:{}|<>
    - 5 to 20 characters
    """
    if not master_password:
        raise serializers.ValidationError("Master password is required.")
    if not match_password_regex(master_password):
        raise serializers.ValidationError(
            "Master password does not match the given constraints."
        )
    return master_password
