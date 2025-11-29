from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import database, models, schemas

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/problems", response_model=List[schemas.Problem])
async def get_problems(db: Session = Depends(get_db)):
    problems = db.query(models.Problem).all()
    return problems

@router.post("/problems", response_model=schemas.Problem)
async def create_problem(problem: schemas.ProblemCreate, db: Session = Depends(get_db)):
    db_problem = models.Problem(**problem.dict())
    db.add(db_problem)
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
