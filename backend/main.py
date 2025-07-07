from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware
from . import ai, crud, models, schemas
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

@app.get("/books/{book_id}/content", response_model=list[schemas.BookContent])
def read_book_content_endpoint(book_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve all content paragraphs for a specific book.
    """
    # First, check if the book exists to return a proper 404
    db_book = crud.get_book(db, book_id=book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    return crud.get_content_for_book(db=db, book_id=book_id)

@app.post("/explain", response_model=schemas.ExplainResponse)
def explain_word_endpoint(request: schemas.ExplainRequest):
    """
    Get an AI-powered explanation for a word in a given context.
    """
    # In a real app, you might want to add more error handling here,
    # for instance, if the AI service fails.
    explanation = ai.get_ai_explanation(word=request.word, context=request.context)
    return schemas.ExplainResponse(explanation=explanation)


@app.post("/vocabulary/", response_model=schemas.Vocabulary)
def create_vocabulary_entry_endpoint(
    vocabulary: schemas.VocabularyCreate, db: Session = Depends(get_db)
):
    """
    Save a new vocabulary word for a user.
    """
    # In a real app, you might check if the word already exists for the user
    # before creating a duplicate entry.
    return crud.create_vocabulary_entry(db=db, vocabulary=vocabulary)


@app.get("/vocabulary/{user_id}", response_model=list[schemas.Vocabulary])
def read_vocabulary_for_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieve all saved vocabulary for a specific user.
    """
    return crud.get_vocabulary_for_user(db=db, user_id=user_id)
