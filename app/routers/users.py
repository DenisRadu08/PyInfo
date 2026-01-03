from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app import database, models, schemas, utils, dependencies
from app.database import get_db

router = APIRouter()

@router.post("/users", response_model=schemas.User)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter((models.User.email == user.email) | (models.User.username == user.username)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")
    
    hashed_password = utils.get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password, is_admin=user.is_admin)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/register")
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print("DEBUG: Register endpoint hit!", flush=True)
    # 1. Check if user exists
    db_user = db.query(models.User).filter((models.User.email == user.email) | (models.User.username == user.username)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")

    # 2. Create User
    hashed_password = utils.get_password_hash(user.password)
    # Default is_admin to False for public registration unless specified? 
    # Schema allows setting is_admin, but for public register we might forcibly set it False.
    # The prompt doesn't specify restriction, but usually register is for normal users.
    # We'll use the schema value but default schema is False. 
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        is_admin=False # Force false for public registration
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 3. Auto Login (Generate Token)
    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "username": new_user.username, "email": new_user.email}

@router.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/my-submissions")
async def read_users_submissions(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user.submissions
