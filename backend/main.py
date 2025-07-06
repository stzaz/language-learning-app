from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import get_db, engine

# This creates the database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.post("/books/", response_model=schemas.Book)
def create_book_endpoint(book: schemas.BookCreate, db: Session = Depends(get_db)):
    """
    Create a new book in the database.
    """
    return crud.create_book(db=db, book=book)

