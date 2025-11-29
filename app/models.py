from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    difficulty = Column(String)

    test_cases = relationship("TestCase", back_populates="problem")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    input_data = Column(Text)
    expected_output = Column(Text)
    problem_id = Column(Integer, ForeignKey("problems.id"))

    problem = relationship("Problem", back_populates="test_cases")
