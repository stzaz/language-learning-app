# backend/models.py
import uuid
from sqlalchemy import Column, Integer, String, DateTime, func, Text, ForeignKey, Float, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .database import Base

# --- ADD THE NEW ReadingActivity MODEL ---
class ReadingActivity(Base):
    __tablename__ = "reading_activities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    minutes_read = Column(Integer, default=0)

    # A user can only have one activity entry per day
    __table_args__ = (UniqueConstraint('user_id', 'date', name='_user_date_uc'),)

    # Establish the relationship back to the User
    user = relationship("User", back_populates="reading_history")

# --- NEW: UserBookLink Model ---
# This table tracks a user's personal progress in a specific book
class UserBookLink(Base):
    __tablename__ = "user_book_links"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id"), primary_key=True)
    progress = Column(Integer, default=0)
    last_read_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="books_in_library")
    book = relationship("Book", back_populates="users_tracking_progress")

# --- Updated User Model ---
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False) # Changed from username
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # This creates the `user.vocabulary` attribute
    vocabulary = relationship("Vocabulary", back_populates="owner")
    # This allows us to easily access a user's activity history via user.reading_history
    reading_history = relationship("ReadingActivity", back_populates="user", cascade="all, delete-orphan")
    # This checks the current books in the user's library
    books_in_library = relationship("UserBookLink", back_populates="user", cascade="all, delete-orphan")

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
    rating = Column(Float, nullable=True)
    content = relationship("BookContent", back_populates="book", cascade="all, delete-orphan")
    users_tracking_progress = relationship("UserBookLink", back_populates="book", cascade="all, delete-orphan")

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
