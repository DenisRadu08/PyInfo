from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import os

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# SECURITY WARNING: This fallback key is for development convenience only.
# In production, this must be overridden by an environment variable.
# Încearcă să citească cheia din variabilele de mediu (.env)
SECRET_KEY = os.getenv("SECRET_KEY")

# Verificare de siguranță: Dacă cheia nu există, OPREȘTE serverul imediat.
if not SECRET_KEY:
    print("❌ EROARE CRITICĂ: Variabila SECRET_KEY lipsește din .env!", file=sys.stderr)
    print("   Aplicația nu poate porni din motive de securitate.", file=sys.stderr)
    sys.exit(1) # Oprește procesul cu cod de eroare

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
