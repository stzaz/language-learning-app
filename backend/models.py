# backend/models.py
import uuid
from sqlalchemy import Column, Integer, String, DateTime, func, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .database import Base

# --- Updated User Model ---
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False) # Changed from username
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # This creates the `user.vocabulary` attribute
    vocabulary = relationship("Vocabulary", back_populates="owner")

# --- Existing Book Model ---
class Book(Base):
    __tablename__ = "books"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, index=True)
    author = Column(String, index=True)
    language = Column(String)
    difficulty_level = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    genre = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    progress = Column(Integer, default=0, nullable=True)
    rating = Column(Float, nullable=True)

    content = relationship("BookContent", back_populates="book", cascade="all, delete-orphan")

# --- Existing BookContent Model ---
class BookContent(Base):
    __tablename__ = "book_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id"))
    paragraph_index = Column(Integer, nullable=False)
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)

    book = relationship("Book", back_populates="content")

# --- Existing Vocabulary Model ---
# No changes needed here, as it was already correctly linked via user_id
class Vocabulary(Base):
    __tablename__ = "vocabulary"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    word = Column(String, index=True, nullable=False)
    definition = Column(Text, nullable=False)
    context_sentence = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="vocabulary")
