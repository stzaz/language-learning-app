from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import date, datetime, timedelta, timezone
from typing import Set
from . import models, schemas, security


# --- User CRUD Functions (Updated for Email) ---

def get_user(db: Session, user_id: UUID):
    """
    Retrieve a single user by their ID.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """
    Retrieve a single user by their email address.
    """
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    """
    Create a new user, hashing the password before saving.
    """
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticate a user by checking their email and verifying their password.
    Returns the user object if successful, otherwise None.
    """
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user

# --- Reading Activity CRUD Function ---
def log_or_update_reading_activity(db: Session, user_id: UUID, minutes: int):
    """
    Finds today's reading activity for a user. If it exists, adds minutes to it.
    If it doesn't exist, a new entry is created for today's date.
    """
    today = date.today()
    
    activity = db.query(models.ReadingActivity).filter(
        models.ReadingActivity.user_id == user_id,
        models.ReadingActivity.date == today
    ).first()
    
    if activity:
        activity.minutes_read += minutes
    else:
        activity = models.ReadingActivity(
            user_id=user_id,
            date=today,
            minutes_read=minutes
        )
        db.add(activity)
        
    db.commit()
    db.refresh(activity)
    return activity

# --- User Stats Calculation Function ---
def get_user_stats(db: Session, user: models.User) -> schemas.UserStats:
    """
    Calculates the reading streak, total words learned, and total minutes read for a user.
    """
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    total_words_learned = len(user.vocabulary)
    
    # Use a query to sum up minutes for better performance with large histories
    total_minutes_read = db.query(func.sum(models.ReadingActivity.minutes_read)).filter(
        models.ReadingActivity.user_id == user.id
    ).scalar() or 0
    
    reading_streak = 0
    
    recent_activity_dates = sorted(
        [activity.date for activity in user.reading_history],
        reverse=True
    )
    
    if not recent_activity_dates:
        return schemas.UserStats(
            reading_streak=0,
            total_words_learned=total_words_learned,
            total_minutes_read=total_minutes_read
        )
        
    if recent_activity_dates[0] == today or recent_activity_dates[0] == yesterday:
        reading_streak = 1
        for i in range(len(recent_activity_dates) - 1):
            if recent_activity_dates[i] - recent_activity_dates[i+1] == timedelta(days=1):
                reading_streak += 1
            else:
                break
                
    return schemas.UserStats(
        reading_streak=reading_streak,
        total_words_learned=total_words_learned,
        total_minutes_read=total_minutes_read
    )

# --- NEW: Comprehensible Input Recommendation Logic (Replaces old function) ---
def get_user_recommendations(db: Session, user: models.User, limit: int = 3) -> list[models.Book]:
    """
    Generates book recommendations based on the user's vocabulary knowledge,
    aiming for the optimal 98% "comprehensible input" zone.
    """
    
    # 1. Get the set of words the user has learned.
    user_known_words: Set[str] = {v.word.lower() for v in user.vocabulary}

    # 2. Handle the "cold start" problem for new users.
    if not user_known_words:
        print("User has no vocabulary. Recommending easiest books.")
        # Fallback: Recommend the easiest books available.
        # Ideally, this would also filter by the user's target language.
        return db.query(models.Book).order_by(models.Book.difficulty_level.asc()).limit(limit).all()

    # 3. Get IDs of all books the user has in their library to exclude them.
    user_book_ids_in_library = {link.book_id for link in user.books_in_library}

    # 4. Get all candidate books, excluding those already in the user's library.
    candidate_books = db.query(models.Book).filter(
        models.Book.id.notin_(user_book_ids_in_library)
    ).all()

    # 5. Score the candidate books based on vocabulary coverage.
    recommendation_scores = []
    
    OPTIMAL_COVERAGE = 0.98  # Target 98% known words

    for book in candidate_books:
        # The book.unique_words relationship gives us all Word objects for the book.
        book_words: Set[str] = {w.text.lower() for w in book.unique_words}
        
        if not book_words:
            continue # Skip books with no vocabulary analyzed.

        # Calculate how many of the book's words the user knows.
        known_words_in_book = user_known_words.intersection(book_words)
        
        # Calculate the lexical coverage percentage.
        coverage = len(known_words_in_book) / len(book_words)
        
        # The score is how close the coverage is to our optimal target.
        # A smaller difference is better, so we subtract from 1.
        score = 1.0 - abs(OPTIMAL_COVERAGE - coverage)
        
        recommendation_scores.append((score, book))
        print(f"Book: '{book.title}', Coverage: {coverage:.2%}, Score: {score:.4f}")


    # 6. Sort by score (descending) and return the top results.
    recommendation_scores.sort(key=lambda x: x[0], reverse=True)
    
    recommended_books = [book for score, book in recommendation_scores]
    
    return recommended_books[:limit]


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
    db_vocab_entry = models.Vocabulary(**vocabulary.model_dump(), user_id=user_id)
    db.add(db_vocab_entry)
    db.commit()
    db.refresh(db_vocab_entry)
    return db_vocab_entry

def get_all_vocabulary(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Vocabulary).order_by(models.Vocabulary.created_at.desc()).offset(skip).limit(limit).all()

def get_vocabulary_for_user(db: Session, user_id: UUID):
    return db.query(models.Vocabulary).filter(models.Vocabulary.user_id == user_id).order_by(models.Vocabulary.created_at.desc()).all()


# --- SRS Logic Function ---
def update_vocabulary_srs(db: Session, vocab_item: models.Vocabulary, performance_rating: int):
    if performance_rating >= 3:
        if vocab_item.interval == 1:
            new_interval = 6
        else:
            new_interval = round(vocab_item.interval * vocab_item.ease_factor)
    else:
        new_interval = 1

    new_ease_factor = vocab_item.ease_factor + (0.1 - (5 - performance_rating) * (0.08 + (5 - performance_rating) * 0.02))
    
    if new_ease_factor < 1.3:
        new_ease_factor = 1.3
        
    vocab_item.ease_factor = new_ease_factor
    vocab_item.interval = new_interval
    vocab_item.next_review_at = datetime.now(timezone.utc) + timedelta(days=new_interval)
    
    db.commit()
    db.refresh(vocab_item)
    return vocab_item