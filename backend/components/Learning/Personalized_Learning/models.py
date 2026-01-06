from pydantic import BaseModel, Field
from typing import List, Optional
import uuid

class LearningResource(BaseModel):
    title: str
    url: str

class Role(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    tags: List[str]
    resources: List[LearningResource]

class Sector(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = None
    icon: Optional[str] = None
    roles: List[Role]
