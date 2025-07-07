from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List # Make sure to import List

# ==================================
# Schemas for BookContent
# ==================================

# Shared properties
class BookContentBase(BaseModel):
    paragraph_index: int
    original_text: str
    translated_text: str

# Properties to receive on item creation
class BookContentCreate(BookContentBase):
    pass

# Properties to return to client
class BookContent(BookContentBase):
    id: UUID
    book_id: UUID

    class Config:
        from_attributes = True


# ==================================
# Schemas for Book
# ==================================

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
    # Add this line to represent the relationship
    # It will expect a list of BookContent schemas
    content: List[BookContent] = []

    class Config:
        from_attributes = True


# ==================================
# Schemas for AI Explanations
# ==================================

class ExplainRequest(BaseModel):
    word: str
    context: str

class ExplainResponse(BaseModel):
    explanation: str

