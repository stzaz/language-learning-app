# backend/main.py
from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware

# --- Robust Environment Loading ---
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# --- Local Module Imports ---
from . import ai, crud, models, schemas
from .database import get_db, engine

# This creates the database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS Middleware ---
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

# --- NEW: User Endpoints ---
@app.post("/users/", response_model=schemas.User, tags=["Users"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    Checks if the username is already taken before creating.
    """
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

# --- Book Endpoints ---
@app.post("/books/", response_model=schemas.Book, tags=["Books"])
def create_book_endpoint(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return crud.create_book(db=db, book=book)

@app.get("/books/", response_model=List[schemas.Book], tags=["Books"])
def read_books_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_books(db, skip=skip, limit=limit)

@app.get("/books/{book_id}", response_model=schemas.Book, tags=["Books"])
def read_book_endpoint(book_id: UUID, db: Session = Depends(get_db)):
    db_book = crud.get_book(db, book_id=book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return db_book

@app.get("/books/{book_id}/content", response_model=List[schemas.BookContent], tags=["Books"])
def read_book_content_endpoint(book_id: UUID, db: Session = Depends(get_db)):
    db_book = crud.get_book(db, book_id=book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return crud.get_content_for_book(db=db, book_id=book_id)

# --- AI Endpoint ---
@app.post("/explain", response_model=schemas.ExplainResponse, tags=["AI"])
def explain_word_endpoint(request: schemas.ExplainRequest, db: Session = Depends(get_db)):
    # Pass the db session to the AI function if it needs it in the future
    explanation = ai.get_ai_explanation(
        db=db,
        word=request.word, 
        context=request.context,
        language="es" # Hardcoded for now
    )
    return schemas.ExplainResponse(explanation=explanation)

# --- Vocabulary Endpoints ---
@app.post("/vocabulary/", response_model=schemas.Vocabulary, tags=["Vocabulary"])
def create_vocabulary_entry_endpoint(
    vocabulary: schemas.VocabularyCreate, db: Session = Depends(get_db)
):
    # In a real app, this would get the user_id from the authenticated user token
    user_id = crud.get_user_by_username(db, "user123").id # Hardcoded for now
    return crud.create_vocabulary_entry(db=db, vocabulary=vocabulary, user_id=user_id)

@app.get("/vocabulary/", response_model=List[schemas.Vocabulary], tags=["Vocabulary"])
def read_all_vocabulary_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all_vocabulary(db, skip=skip, limit=limit)

@app.get("/vocabulary/{user_id}", response_model=List[schemas.Vocabulary], tags=["Vocabulary"])
def read_vocabulary_for_user_endpoint(user_id: UUID, db: Session = Depends(get_db)): # Updated to UUID
    return crud.get_vocabulary_for_user(db=db, user_id=user_id)
