import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import subprocess
import sys
from . import models, schemas, dependencies
from .database import engine, get_db
from app.routers import problems, users

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 1. Definim originile implicite (pentru dezvoltare locală)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://pycodearena.me",
    "https://www.pycodearena.me",
]

# 2. Adăugăm dinamic originea de producție din .env
# Aici este trucul! Codul caută variabila "PROD_DOMAIN"
prod_domain = os.getenv("PROD_DOMAIN")

if prod_domain:
    # Dacă există (pe server), o adăugăm în listă
    origins.append(prod_domain)
    print(f"🌍 Added production domain to CORS: {prod_domain}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Explicit list, NO wildcard "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router)
app.include_router(users.router)

from app.services.code_executor import execute_code

@app.post("/run")
async def run_code(submission: schemas.CodeSubmission):
    result = execute_code(
        code=submission.code,
        input_data=submission.input_data if submission.input_data else "",
        timeout=2.0
    )
    
    # Adapt the result for the frontend
    return {
        "output": result["output"],
        "error": result["error"] if result["status"] == "Accepted" or result["status"] == "Runtime Error" else result["status"]
    }

@app.post("/problems/{problem_id}/tests", response_model=schemas.TestCase)
async def create_test_case(problem_id: int, test_case: schemas.TestCaseCreate, db: Session = Depends(get_db)):
    db_test_case = models.TestCase(**test_case.dict(), problem_id=problem_id)
    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)
    return db_test_case

@app.post("/submit")
async def submit_code(
    submission: schemas.SubmissionRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # 1. Get Problem
    problem = db.query(models.Problem).filter(models.Problem.id == submission.problem_id).first()
    if not problem:
        return {"status": "Error", "message": "Problem not found"}
    
    # 2. Iterate through test cases
    for test in problem.test_cases:
        # 3. Run user code using execution service
        result = execute_code(
            code=submission.code, 
            input_data=test.input_data,
            timeout=2.0
        )
        
        # 4. Check Execution Status
        if result["status"] != "Accepted":
             # Log failure (TLE, MLE, Runtime Error)
            db_submission = models.Submission(
                code=submission.code,
                status=result["status"], # e.g., "Time Limit Exceeded"
                user_id=current_user.id,
                problem_id=submission.problem_id
            )
            db.add(db_submission)
            db.commit()
            
            return {
                "status": "Runtime Error" if result["status"] == "Runtime Error" else result["status"], 
                "details": result["error"] if result["error"] else result["status"]
            }

        # 5. Compare Logic
        def normalize_output(text):
            return "\n".join([line.rstrip() for line in text.strip().splitlines()])

        actual = normalize_output(result["output"])
        expected = normalize_output(test.expected_output)
        
        if actual != expected:
            # Log failure (Wrong Answer)
            db_submission = models.Submission(
                code=submission.code,
                status="Wrong Answer",
                user_id=current_user.id,
                problem_id=submission.problem_id
            )
            db.add(db_submission)
            db.commit()
            
            return {
                "status": "Wrong Answer", 
                "details": f"Failed on input: {test.input_data}. Expected: {expected}, Got: {actual}"
            }

    # 6. All passed
    db_submission = models.Submission(
        code=submission.code,
        status="Accepted",
        user_id=current_user.id,
        problem_id=submission.problem_id
    )
    db.add(db_submission)
    db.commit()

    return {"status": "Accepted"}


@app.get("/")
async def root():
    return {"message": "PythonInfo API v1"}

@app.delete("/problems/{problem_id}")
async def delete_problem(problem_id: int, db: Session = Depends(get_db)):
    # 1. Check if problem exists
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # 2. Deleting the problem trigger cascade delete for Submissions and TestCases
    db.delete(problem)
    db.commit()
    
    return {"message": "Problem deleted"}
    



@app.get("/leaderboard")
async def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    leaderboard = []
    
    for user in users:
        # Calculate distinct accepted problems
        solved_problems = {s.problem_id for s in user.submissions if s.status == "Accepted"}
        leaderboard.append({
            "email": user.email,
            "solved_count": len(solved_problems)
        })
    
    # Sort by solved_count descending
    leaderboard.sort(key=lambda x: x["solved_count"], reverse=True)
    
    return leaderboard
