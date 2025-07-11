from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware

# --- Robust Environment Loading ---
# This ensures that your .env file is found correctly.
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# --- Local Module Imports ---
# Using relative imports for consistency within the package
from . import ai, crud, models, schemas
from .database import get_db, engine

# This creates the database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS Middleware ---
# This is essential for allowing your frontend (on localhost:3000)
# to communicate with your backend (on localhost:8000).
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

# --- API Endpoints ---

@app.post("/books/", response_model=schemas.Book)
def create_book_endpoint(book: schemas.BookCreate, db: Session = Depends(get_db)):
    """
    Create a new book in the database.
    """
    return crud.create_book(db=db, book=book)

@app.get("/books/", response_model=List[schemas.Book])
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

@app.get("/books/{book_id}/content", response_model=List[schemas.BookContent])
def read_book_content_endpoint(book_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve all content paragraphs for a specific book.
    """
    db_book = crud.get_book(db, book_id=book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return crud.get_content_for_book(db=db, book_id=book_id)

@app.post("/explain", response_model=schemas.ExplainResponse)
def explain_word_endpoint(request: schemas.ExplainRequest):
    """
    Get an AI-powered explanation for a word in a given context.
    """
    explanation = ai.get_ai_explanation(
        word=request.word, 
        context=request.context,
        language="es" # Hardcoded for now, will be dynamic later
    )
    return schemas.ExplainResponse(explanation=explanation)

@app.post("/vocabulary/", response_model=schemas.Vocabulary)
def create_vocabulary_entry_endpoint(
    vocabulary: schemas.VocabularyCreate, db: Session = Depends(get_db)
):
    """
    Save a new vocabulary word for a user.
    """
    return crud.create_vocabulary_entry(db=db, vocabulary=vocabulary)

# --- Added this new endpoint for the practice page ---
@app.get("/vocabulary/", response_model=List[schemas.Vocabulary])
def read_all_vocabulary_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all saved vocabulary entries for the practice session.
    NOTE: Currently fetches for all users, will be scoped to a specific user later.
    """
    return crud.get_all_vocabulary(db, skip=skip, limit=limit)
# ----------------------------------------------------

@app.get("/vocabulary/{user_id}", response_model=List[schemas.Vocabulary])
def read_vocabulary_for_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieve all saved vocabulary for a specific user.
    """
    return crud.get_vocabulary_for_user(db=db, user_id=user_id)
