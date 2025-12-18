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

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router)
app.include_router(users.router)

@app.post("/run")
async def run_code(submission: schemas.CodeSubmission):
    try:
        process = subprocess.Popen(
            [sys.executable, "-c", submission.code],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        input_str = submission.input_data if submission.input_data else ""
        stdout, stderr = process.communicate(input=input_str, timeout=3)
        
        return {"output": stdout, "error": stderr}
    except subprocess.TimeoutExpired:
        process.kill()
        return {"output": "", "error": "Execution timed out"}
    except Exception as e:
        return {"output": "", "error": str(e)}

@app.post("/problems/{problem_id}/tests", response_model=schemas.TestCase)
async def create_test_case(problem_id: int, test_case: schemas.TestCaseCreate, db: Session = Depends(get_db)):
    db_test_case = models.TestCase(**test_case.dict(), problem_id=problem_id)
    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)
    return db_test_case




import json

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
        try:
            # 3. Run user code using subprocess.Popen (Binary Mode)
            process = subprocess.Popen(
                [sys.executable, "-c", submission.code],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                # text=False means we work with bytes
            )
            
            # Write input (encoded) and get output (binary)
            input_bytes = test.input_data.encode()
            stdout, stderr = process.communicate(input=input_bytes, timeout=2)
            
            # 4. Compare results
            # Clean actual: decode -> strip
            actual = stdout.decode().strip()
            # Clean expected: strip
            expected = test.expected_output.strip()
            
            if actual != expected:
                # Log failure
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

        except subprocess.TimeoutExpired:
            process.kill()
            db_submission = models.Submission(
                code=submission.code,
                status="Time Limit Exceeded",
                user_id=current_user.id,
                problem_id=submission.problem_id
            )
            db.add(db_submission)
            db.commit()
            return {"status": "Runtime Error", "details": "Time Limit Exceeded"}
            
        except Exception as e:
            return {"status": "Runtime Error", "details": str(e)}

    # 5. All passed
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
    
    # 2. Manually delete related data first (Foreign Key handling)
    # Delete Submissions
    db.query(models.Submission).filter(models.Submission.problem_id == problem_id).delete()
    
    # Delete TestCases
    db.query(models.TestCase).filter(models.TestCase.problem_id == problem_id).delete()
    
    # 3. Delete the Problem
    db.delete(problem)
    db.commit()
    
    return {"message": "Problem deleted"}

@app.put("/problems/{problem_id}", response_model=schemas.Problem)
async def update_problem(problem_id: int, problem_update: schemas.ProblemCreate, db: Session = Depends(get_db)):
    # 1. Check if problem exists
    db_problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # 2. Update problem fields
    db_problem.title = problem_update.title
    db_problem.description = problem_update.description
    db_problem.difficulty = problem_update.difficulty
    
    # 3. Handle Test Cases (Complete Replacement)
    # Clear old test cases
    db.query(models.TestCase).filter(models.TestCase.problem_id == problem_id).delete()
    
    # Create new test cases from payload
    for tc in problem_update.test_cases:
        db_tc = models.TestCase(
            input_data=tc.input_data,
            expected_output=tc.expected_output,
            problem_id=problem_id
        )
        db.add(db_tc)
        
    db.commit()
    db.refresh(db_problem)
    return db_problem
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
