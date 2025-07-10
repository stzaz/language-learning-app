import uuid
# Add these imports
from sqlalchemy import Column, Integer, String, DateTime, func, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.types import UUID
from .database import Base

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

    # Add this relationship to the Book model
    # This creates the `book.content` attribute
    content = relationship("BookContent", back_populates="book", cascade="all, delete-orphan")


# New BookContent model
class BookContent(Base):
    __tablename__ = "book_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id"))
    paragraph_index = Column(Integer, nullable=False)
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)

    # This creates the `book_content.book` attribute
    book = relationship("Book", back_populates="content")


class Vocabulary(Base):
    __tablename__ = "vocabulary"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # In a real app with user authentication, this would be a ForeignKey to a users table.
    user_id = Column(String, index=True, nullable=False)
    word = Column(String, index=True, nullable=False)
    definition = Column(Text, nullable=False)
    context_sentence = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())