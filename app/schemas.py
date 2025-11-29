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

class ProblemBase(BaseModel):
    title: str
    description: str
    difficulty: str

class ProblemCreate(ProblemBase):
    pass

class Problem(ProblemBase):
    id: int
    test_cases: List[TestCase] = []

    class Config:
        from_attributes = True

class CodeSubmission(BaseModel):
    code: str
