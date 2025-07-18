# backend/schemas.py
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional

# ==================================
# Schemas for BookContent
# ==================================

class BookContentBase(BaseModel):
    paragraph_index: int
    original_text: str
    translated_text: str

class BookContentCreate(BookContentBase):
    pass

class BookContent(BookContentBase):
    id: UUID
    book_id: UUID

    model_config = ConfigDict(from_attributes=True)



# ==================================
# Schemas for Book
# ==================================

class BookBase(BaseModel):
    title: str
    author: str
    language: str
    difficulty_level: int
    genre: Optional[str] = None
    cover_image_url: Optional[str] = None
    progress: Optional[int] = None
    rating: Optional[float] = None

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: UUID
    created_at: datetime
    content: List[BookContent] = []

    model_config = ConfigDict(from_attributes=True)

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

class VocabularyBase(BaseModel):
    word: str
    definition: str
    context_sentence: str

class VocabularyCreate(VocabularyBase):
    pass

class Vocabulary(VocabularyBase):
    id: UUID
    user_id: UUID # Updated from str to UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================================
# Schemas for User
# ==================================

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str # Password is required for creation

class User(UserBase):
    id: UUID
    created_at: datetime
    vocabulary: List[Vocabulary] = [] # Include the user's vocabulary list

    model_config = ConfigDict(from_attributes=True)

# --- Add this new schema for the login response ---
# ==================================
# Schemas for Token
# ==================================
# --- Add this new schema for the token's payload ---
class TokenData(BaseModel):
    email: Optional[EmailStr] = None

class Token(BaseModel):
    access_token: str
    token_type: str
# ----------------------------------------------------
