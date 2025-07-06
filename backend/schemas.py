from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

# Shared properties
class BookBase(BaseModel):
    title: str
    author: str
    language: str
    difficulty_level: int

# Properties to receive on item creation
class BookCreate(BookBase):
    pass

# Properties to return to client
class Book(BookBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

