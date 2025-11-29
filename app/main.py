from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import subprocess
import sys
from . import models, schemas
from .database import engine
from app.routers import problems

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

@app.post("/run")
async def run_code(submission: schemas.CodeSubmission):
    try:
        result = subprocess.run(
            [sys.executable, "-c", submission.code],
            capture_output=True,
            text=True,
            timeout=3
        )
        return {"output": result.stdout, "error": result.stderr}
    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out"}
    except Exception as e:
        return {"output": "", "error": str(e)}

@app.post("/problems/{problem_id}/tests", response_model=schemas.TestCase)
async def create_test_case(problem_id: int, test_case: schemas.TestCaseCreate, db: Session = Depends(problems.get_db)):
    db_test_case = models.TestCase(**test_case.dict(), problem_id=problem_id)
    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)
    return db_test_case

@app.post("/submit/{problem_id}")
async def submit_solution(problem_id: int, submission: schemas.CodeSubmission, db: Session = Depends(problems.get_db)):
    test_cases = db.query(models.TestCase).filter(models.TestCase.problem_id == problem_id).all()
    results = []

    for test in test_cases:
        try:
            result = subprocess.run(
                [sys.executable, "-c", submission.code],
                input=test.input_data,
                capture_output=True,
                text=True,
                timeout=3
            )
            actual_output = result.stdout.strip()
            expected_output = test.expected_output.strip()
            passed = actual_output == expected_output
            results.append({
                "test_id": test.id,
                "passed": passed,
                "input": test.input_data,
                "expected": expected_output,
                "actual": actual_output,
                "error": result.stderr
            })
        except subprocess.TimeoutExpired:
            results.append({
                "test_id": test.id,
                "passed": False,
                "error": "Execution timed out"
            })
        except Exception as e:
            results.append({
                "test_id": test.id,
                "passed": False,
                "error": str(e)
            })
    
    return results

@app.get("/")
async def root():
    return {"message": "PythonInfo API v1"}
