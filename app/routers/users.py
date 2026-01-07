from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app import database, models, schemas, utils, dependencies
from app.database import get_db
import os

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

@router.get("/users/all", response_model=List[schemas.User])
async def read_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = db.query(models.User).all()
    return users

SUPER_ADMIN_EMAIL = os.getenv("SUPER_ADMIN_EMAIL")

@router.put("/users/{user_id}/toggle-admin", response_model=schemas.User)
async def toggle_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if current user is Super Admin
    if current_user.email != SUPER_ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Only the Super Admin can change roles")
    
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot toggle your own admin rights")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check immunity: Cannot demote Super Admin
    if user.email == SUPER_ADMIN_EMAIL:
        raise HTTPException(status_code=400, detail="Cannot demote the Super Admin")

    # Toggle boolean (or 0/1 integer)
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    return user
