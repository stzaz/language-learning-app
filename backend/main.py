# backend/main.py
from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, timezone

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

# --- NEW: User Stats & Activity Endpoints ---
class LogActivityRequest(schemas.BaseModel):
    minutes: int

@app.get("/users/me/", response_model=schemas.User, tags=["Users"])
def read_users_me(current_user: schemas.User = Depends(security.get_current_user)):
    """
    Fetch the currently authenticated user.
    """
    return current_user

@app.post("/users/me/activity", response_model=schemas.ReadingActivity, tags=["Users"])
def log_reading_activity_endpoint(
    request: LogActivityRequest,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """
    Logs reading activity for the current user.
    If an entry for today exists, it updates the minutes. Otherwise, it creates a new one.
    """
    if request.minutes <= 0:
        raise HTTPException(status_code=400, detail="Minutes must be positive.")

    return crud.log_or_update_reading_activity(
        db=db, user_id=current_user.id, minutes=request.minutes
    )

@app.get("/users/me/stats", response_model=schemas.UserStats, tags=["Users"])
def get_user_stats_endpoint(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """
    Calculates and returns key stats for the authenticated user's dashboard.
    """
    stats = crud.get_user_stats(db=db, user=current_user)
    return stats

@app.get("/users/me/recommendations", response_model=list[schemas.Book], tags=["Users"])
def get_user_recommendations_endpoint(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """
    Generates and returns book recommendations for the currently authenticated user.
    """
    recommendations = crud.get_user_recommendations(db=db, user=current_user)
    return recommendations

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

# --- Vocabulary Endpoints (CLEANED UP AND REORDERED) ---

@app.get("/vocabulary/due-for-review", response_model=list[schemas.Vocabulary], tags=["Vocabulary"])
def get_due_vocabulary_for_user_endpoint(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """ Fetches vocabulary words that are due for review for the current user. """
    due_words = db.query(models.Vocabulary).filter(
        models.Vocabulary.user_id == current_user.id,
        models.Vocabulary.next_review_at <= datetime.now(timezone.utc)
    ).all()
    return due_words

@app.post("/vocabulary/", response_model=schemas.Vocabulary, tags=["Vocabulary"])
def create_vocabulary_entry_endpoint(
    vocabulary: schemas.VocabularyCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """ Save a new vocabulary word for the currently authenticated user. """
    return crud.create_vocabulary_entry(db=db, vocabulary=vocabulary, user_id=current_user.id)

@app.post("/vocabulary/{vocab_id}/review", response_model=schemas.Vocabulary, tags=["Vocabulary"])
def review_vocabulary_word_endpoint(
    vocab_id: UUID,
    request: schemas.ReviewRequest,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """ Updates the SRS data for a specific vocabulary word after a user reviews it. """
    vocab_item = db.query(models.Vocabulary).filter(
        models.Vocabulary.id == vocab_id,
        models.Vocabulary.user_id == current_user.id
    ).first()

    if not vocab_item:
        raise HTTPException(status_code=404, detail="Vocabulary item not found.")
    if not (0 <= request.performance_rating <= 5):
        raise HTTPException(status_code=400, detail="Performance rating must be between 0 and 5.")

    return crud.update_vocabulary_srs(
        db=db,
        vocab_item=vocab_item,
        performance_rating=request.performance_rating
    )
