from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import subprocess
import sys
from app import database, models, schemas, utils, dependencies
from app.database import get_db

router = APIRouter()

@router.get("/problems", response_model=List[schemas.Problem])
async def get_problems(
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(dependencies.get_current_user_optional)
):
    problems = db.query(models.Problem).all()
    
    solved_problem_ids = set()
    if current_user:
        # Fetch solved problem IDs for current user
        solved_submissions = db.query(models.Submission.problem_id)\
            .filter(models.Submission.user_id == current_user.id)\
            .filter(models.Submission.status == "Accepted")\
            .all()
        solved_problem_ids = {s.problem_id for s in solved_submissions}
    
    # Map is_solved status
    # Note: Pydantic models are created from ORM objects. 
    # To attach is_solved, we might need to rely on Pydantic's from_attributes (orm_mode) 
    # or manually construct the response. 
    # Since problems are ORM objects, we can just attach the attribute dynamically 
    # if we are careful, or better, return dicts/modified objects.
    
    results = []
    for problem in problems:
        # Create a dict or copy to modify
        # Assuming schemas.Problem accepts extra fields or we rely on attribute access
        # Since we cannot easily modify ORM objects in place safely for other requests,
        # we will let Pydantic handle it by setting the property on the instance 
        # (which works for that python object in memory)
        problem.is_solved = problem.id in solved_problem_ids
        results.append(problem)
        
    return results

@router.post("/problems", response_model=schemas.Problem)
async def create_problem(problem: schemas.ProblemCreate, db: Session = Depends(get_db)):
    problem_data = problem.dict()
    test_cases_data = problem_data.pop('test_cases', [])
    
    db_problem = models.Problem(**problem_data)
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    
    for tc in test_cases_data:
        db_tc = models.TestCase(**tc, problem_id=db_problem.id)
        db.add(db_tc)
    
    db.commit()
    db.refresh(db_problem)
    return db_problem

@router.get("/problems/{problem_id}", response_model=schemas.Problem)
async def read_problem(problem_id: int, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if problem is None:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@router.delete("/tests/{test_id}")
async def delete_test_case(test_id: int, db: Session = Depends(get_db)):
    test_case = db.query(models.TestCase).filter(models.TestCase.id == test_id).first()
    if test_case is None:
        raise HTTPException(status_code=404, detail="Test case not found")
    db.delete(test_case)
    db.commit()
    return {"message": "Test deleted"}

# @router.post("/submit/{problem_id}")
# async def submit_solution(
#     problem_id: int, 
#     submission: schemas.CodeSubmission, 
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(dependencies.get_current_user)
# ):
#     print(f"User {current_user.email} is submitting")
#     test_cases = db.query(models.TestCase).filter(models.TestCase.problem_id == problem_id).all()
#     results = []
# 
#     for test in test_cases:
#         try:
#             result = subprocess.run(
#                 [sys.executable, "-c", submission.code],
#                 input=test.input_data,
#                 capture_output=True,
#                 text=True,
#                 timeout=3
#             )
#             actual_output = result.stdout.strip()
#             expected_output = test.expected_output.strip()
#             passed = actual_output == expected_output
#             results.append({
#                 "test_id": test.id,
#                 "passed": passed,
#                 "input": test.input_data,
#                 "expected": expected_output,
#                 "actual": actual_output,
#                 "error": result.stderr
#             })
#         except subprocess.TimeoutExpired:
#             results.append({
#                 "test_id": test.id,
#                 "passed": False,
#                 "error": "Execution timed out"
#             })
#         except Exception as e:
#             results.append({
#                 "test_id": test.id,
#                 "passed": False,
#                 "error": str(e)
#             })
#     
#     # Determine overall status
#     overall_status = "Passed" if all(r["passed"] for r in results) else "Failed"
# 
#     # Create submission record
#     db_submission = models.Submission(
#         code=submission.code,
#         status=overall_status,
#         user_id=current_user.id,
#         problem_id=problem_id
#     )
#     db.add(db_submission)
#     db.commit()
#     db.refresh(db_submission)
# 
#     # Add submission_id to results (optional, but requested)
#     for result in results:
#         result["submission_id"] = db_submission.id
# 
#     return results
