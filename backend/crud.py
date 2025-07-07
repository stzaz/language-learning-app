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
