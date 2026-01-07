from pydantic import BaseModel, field_validator
from typing import List
import re

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

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*]', v):
            raise ValueError('Password must contain at least one special character (!@#$%^&*)')
        return v

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
    hint: str | None = None
    editorial: str | None = None

class TagBase(BaseModel):
    name: str

class Tag(TagBase):
    id: int
    class Config:
        from_attributes = True

class ProblemCreate(ProblemBase):
    test_cases: List[TestCaseCreate] = []
    tags: List[str] = []

class Problem(ProblemBase):
    id: int
    test_cases: List[TestCase] = []
    tags: List[Tag] = []
    is_solved: bool = False

    class Config:
        from_attributes = True

class CodeSubmission(BaseModel):
    code: str
    input_data: str | None = None

class SubmissionResult(BaseModel):
    status: str
    details: str | None = None
    execution_time: float | None = None
    memory_usage: int | None = None

class SubmissionRequest(BaseModel):
    code: str
    problem_id: int
