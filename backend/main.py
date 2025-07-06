from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware
from . import crud, models, schemas
from .database import get_db, engine

# This creates the database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/books/", response_model=schemas.Book)
def create_book_endpoint(book: schemas.BookCreate, db: Session = Depends(get_db)):
    """
    Create a new book in the database.
    """
    return crud.create_book(db=db, book=book)

@app.get("/books/", response_model=list[schemas.Book])
def read_books_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of books from the database.
    """
    return crud.get_books(db, skip=skip, limit=limit)

@app.get("/books/{book_id}", response_model=schemas.Book)
def read_book_endpoint(book_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve a specific book from the database by its ID.
    """
    db_book = crud.get_book(db, book_id=book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return db_book

