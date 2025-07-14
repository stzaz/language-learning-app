# backend/crud.py
from sqlalchemy.orm import Session
from uuid import UUID
from . import models, schemas, security # Import the new security module

# --- User CRUD Functions ---

def get_user(db: Session, user_id: UUID):
    """
    Retrieve a single user by their ID.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """
    Retrieve a single user by their email.
    """
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    """
    Create a new user in the database.
    """
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- NEW: Function to authenticate a user ---
def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticate a user. Returns the user object if successful, otherwise None.
    """
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user
# -----------------------------------------


# --- Book CRUD Functions ---

def create_book(db: Session, book: schemas.BookCreate):
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def get_books(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Book).offset(skip).limit(limit).all()

def get_book(db: Session, book_id: UUID):
    return db.query(models.Book).filter(models.Book.id == book_id).first()

def get_content_for_book(db: Session, book_id: UUID):
    return db.query(models.BookContent).filter(models.BookContent.book_id == book_id).order_by(models.BookContent.paragraph_index).all()


# --- Vocabulary CRUD Functions ---

def create_vocabulary_entry(db: Session, vocabulary: schemas.VocabularyCreate, user_id: UUID):
    """
    Create a new vocabulary entry for a specific user.
    """
    db_vocab_entry = models.Vocabulary(**vocabulary.model_dump(), user_id=user_id)
    db.add(db_vocab_entry)
    db.commit()
    db.refresh(db_vocab_entry)
    return db_vocab_entry

def get_all_vocabulary(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieves all vocabulary entries, ignoring user for now.
    """
    return db.query(models.Vocabulary).order_by(models.Vocabulary.created_at.desc()).offset(skip).limit(limit).all()

def get_vocabulary_for_user(db: Session, user_id: UUID):
    """
    Retrieves all vocabulary for a specific user.
    """
    return db.query(models.Vocabulary).filter(models.Vocabulary.user_id == user_id).order_by(models.Vocabulary.created_at.desc()).all()
