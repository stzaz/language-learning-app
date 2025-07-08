from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional

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


class AIExplanation(BaseModel):
    definition: str
    part_of_speech: str
    translation: str
    contextual_insight: Optional[str] = None

class ExplainResponse(BaseModel):
    explanation: AIExplanation


# ==================================
# Schemas for Vocabulary
# ==================================

# Shared properties
class VocabularyBase(BaseModel):
    word: str
    definition: str
    context_sentence: str
    user_id: str  # For now, a simple string.

# Properties to receive on item creation
class VocabularyCreate(VocabularyBase):
    pass

# Properties to return to client
class Vocabulary(VocabularyBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
