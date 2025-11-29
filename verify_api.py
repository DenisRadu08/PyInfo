from app.database import SessionLocal, engine
from app import models, schemas
from app.routers import problems

# Create tables
models.Base.metadata.create_all(bind=engine)

# Create a session
db = SessionLocal()

try:
    # Fetch a known problem (ID 1 created previously)
    problem_id = 1
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    
    if problem:
        print(f"Fetched problem {problem_id}: {problem.title}")
    else:
        print(f"Problem {problem_id} not found")

    # Test non-existent problem
    missing_id = 999
    missing_problem = db.query(models.Problem).filter(models.Problem.id == missing_id).first()
    if missing_problem:
        print(f"Fetched problem {missing_id}: {missing_problem.title}")
    else:
        print(f"Problem {missing_id} correctly not found")

finally:
    db.close()
