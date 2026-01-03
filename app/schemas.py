from pydantic import BaseModel
from typing import List

class TestCaseBase(BaseModel):
    input_data: str
    expected_output: str

class TestCaseCreate(TestCaseBase):
    pass

class TestCase(TestCaseBase):
    id: int
    problem_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True

class ProblemBase(BaseModel):
    title: str
    description: str
    difficulty: str

class ProblemCreate(ProblemBase):
    test_cases: List[TestCaseCreate] = []

class Problem(ProblemBase):
    id: int
    test_cases: List[TestCase] = []
    is_solved: bool = False

    class Config:
        from_attributes = True

class CodeSubmission(BaseModel):
    code: str
    input_data: str | None = None

class SubmissionRequest(BaseModel):
    code: str
    problem_id: int
