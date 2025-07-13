# backend/security.py
from passlib.context import CryptContext

# We are telling passlib to use the bcrypt algorithm for hashing.
# This is a strong, widely-used, and recommended hashing algorithm.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a hashed password.
    
    Args:
        plain_password: The password entered by the user.
        hashed_password: The hashed password stored in the database.
        
    Returns:
        True if the passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hashes a plain-text password.
    
    Args:
        password: The plain-text password to hash.
        
    Returns:
        A string containing the hashed password.
    """
    return pwd_context.hash(password)
