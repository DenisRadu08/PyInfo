from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, func, Table
from sqlalchemy.orm import relationship
from .database import Base

# Association Table for Many-to-Many
problem_tags = Table(
    "problem_tags",
    Base.metadata,
    Column("problem_id", Integer, ForeignKey("problems.id")),
    Column("tag_id", Integer, ForeignKey("tags.id"))
)

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    difficulty = Column(String)
    hint = Column(Text, nullable=True)
    editorial = Column(Text, nullable=True)

    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="problem", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=problem_tags, backref="problems")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    input_data = Column(Text)
    expected_output = Column(Text)
    problem_id = Column(Integer, ForeignKey("problems.id"))

    problem = relationship("Problem", back_populates="test_cases")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Integer, default=True)
    is_admin = Column(Integer, default=False)

    submissions = relationship("Submission", back_populates="user")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(Text)
    status = Column(String)
    execution_time = Column(Float, nullable=True)
    memory_usage = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    problem_id = Column(Integer, ForeignKey("problems.id"))

    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")
