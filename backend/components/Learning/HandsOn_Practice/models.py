# backend/components/Learning/HandsOn_Practice/models.py

from pydantic import BaseModel, RootModel
from typing import List, Dict, Any, Literal


# -------------------------
# Coding Challenges
# -------------------------

class TestCase(BaseModel):
    input: List[Any]
    expected: Any


class CodingProblem(BaseModel):
    id: str
    title: str
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
    description: str
    template: str
    fnName: str
    tests: List[TestCase]


# -------------------------
# SQL
# -------------------------

class SqlChallenge(BaseModel):
    id: str
    title: str
    query: str


class SqlExecuteRequest(BaseModel):
    query: str


class SqlRow(RootModel[Dict[str, Any]]):
    pass


# -------------------------
# Python
# -------------------------

class PythonExecuteRequest(BaseModel):
    code: str
    snippetId: str | None = None


class PythonExecuteResponse(BaseModel):
    stdout: str
    stderr: str | None = None
