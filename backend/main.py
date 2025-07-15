# backend/main.py
from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

# --- Robust Environment Loading ---
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# --- Local Module Imports ---
from . import ai, crud, models, schemas, security
from .database import get_db, engine

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

# --- User & Auth Endpoints ---
@app.post("/users/", response_model=schemas.User, tags=["Users"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token, tags=["Users"])
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "user_id": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- NEW: Protected "Me" Endpoint ---
@app.get("/users/me/", response_model=schemas.User, tags=["Users"])
def read_users_me(current_user: schemas.User = Depends(security.get_current_user)):
    """
    Fetch the currently authenticated user.
    """
    return current_user

# --- Book Endpoints ---
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
def explain_word_endpoint(request: schemas.ExplainRequest):
    explanation = ai.get_ai_explanation(
        word=request.word, 
        context=request.context,
        language="es" # Hardcoded for now
    )
    return schemas.ExplainResponse(explanation=explanation)

# --- Vocabulary Endpoints (Updated) ---
@app.post("/vocabulary/", response_model=schemas.Vocabulary, tags=["Vocabulary"])
def create_vocabulary_entry_endpoint(
    vocabulary: schemas.VocabularyCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user) # This protects the route
):
    """
    Save a new vocabulary word for the currently authenticated user.
    """
    # The user_id now comes from the authenticated user's token, not hardcoded.
    return crud.create_vocabulary_entry(db=db, vocabulary=vocabulary, user_id=current_user.id)

@app.get("/vocabulary/", response_model=List[schemas.Vocabulary], tags=["Vocabulary"])
def read_all_vocabulary_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # This endpoint remains public for now for the practice page
    return crud.get_all_vocabulary(db, skip=skip, limit=limit)

@app.get("/vocabulary/{user_id}", response_model=List[schemas.Vocabulary], tags=["Vocabulary"])
def read_vocabulary_for_user_endpoint(user_id: UUID, db: Session = Depends(get_db)):
    # In a real app, you would also protect this to ensure a user can only see their own vocabulary
    return crud.get_vocabulary_for_user(db=db, user_id=user_id)
