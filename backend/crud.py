# backend/crud.py
from sqlalchemy.orm import Session
from uuid import UUID
from . import models, schemas

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

def create_vocabulary_entry(db: Session, vocabulary: schemas.VocabularyCreate):
    db_vocab_entry = models.Vocabulary(**vocabulary.model_dump())
    db.add(db_vocab_entry)
    db.commit()
    db.refresh(db_vocab_entry)
    return db_vocab_entry

# --- Add this new function ---
def get_all_vocabulary(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieves all vocabulary entries, ignoring user for now.
    """
    return db.query(models.Vocabulary).order_by(models.Vocabulary.created_at.desc()).offset(skip).limit(limit).all()
# -----------------------------

def get_vocabulary_for_user(db: Session, user_id: str):
    return db.query(models.Vocabulary).filter(models.Vocabulary.user_id == user_id).order_by(models.Vocabulary.created_at.desc()).all()
