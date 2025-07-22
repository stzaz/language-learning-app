# backend/crud.py
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date, timedelta
from . import models, schemas, security # Import the security module


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

# --- NEW: Reading Activity CRUD Function ---
def log_or_update_reading_activity(db: Session, user_id: UUID, minutes: int):
    """
    Finds today's reading activity for a user. If it exists, adds minutes to it.
    If it doesn't exist, a new entry is created for today's date.
    """
    today = date.today()
    
    # Check if an activity record for today already exists
    activity = db.query(models.ReadingActivity).filter(
        models.ReadingActivity.user_id == user_id,
        models.ReadingActivity.date == today
    ).first()
    
    if activity:
        # If it exists, simply add the new minutes
        activity.minutes_read += minutes
        print(f"Updating activity for user {user_id} on {today}. New total: {activity.minutes_read} minutes.")
    else:
        # If it doesn't exist, create a new entry
        activity = models.ReadingActivity(
            user_id=user_id,
            date=today,
            minutes_read=minutes
        )
        db.add(activity)
        print(f"Creating new activity for user {user_id} on {today} with {minutes} minutes.")
        
    db.commit()
    db.refresh(activity)
    return activity

# --- NEW: User Stats Calculation Function ---
def get_user_stats(db: Session, user: models.User) -> schemas.UserStats:
    """
    Calculates the reading streak, total words learned, and total minutes read for a user.
    """
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    # 1. Calculate Total Words Learned
    total_words_learned = len(user.vocabulary)
    
    # 2. Calculate Total Minutes Read
    total_minutes_read = sum(activity.minutes_read for activity in user.reading_history)
    
    # 3. Calculate Reading Streak
    reading_streak = 0
    
    # Get all reading dates for the user, sorted from most recent
    recent_activity_dates = sorted(
        [activity.date for activity in user.reading_history],
        reverse=True
    )
    
    if not recent_activity_dates:
        # If there's no activity, all stats are 0
        return schemas.UserStats(
            reading_streak=0,
            total_words_learned=total_words_learned,
            total_minutes_read=total_minutes_read
        )
        
    # Check if the most recent activity was today or yesterday
    if recent_activity_dates[0] == today or recent_activity_dates[0] == yesterday:
        reading_streak = 1
        # Loop through the rest of the dates to find consecutive days
        for i in range(len(recent_activity_dates) - 1):
            # Check if the next date is exactly one day before the current one
            if recent_activity_dates[i] - recent_activity_dates[i+1] == timedelta(days=1):
                reading_streak += 1
            else:
                # If the chain is broken, stop counting
                break
                
    return schemas.UserStats(
        reading_streak=reading_streak,
        total_words_learned=total_words_learned,
        total_minutes_read=total_minutes_read
    )

# --- NEW: User-Specific Book Recommendation Logic ---
def get_user_recommendations(db: Session, user: models.User, limit: int = 3) -> list[models.Book]:
    """
    Generates book recommendations for a specific user.
    It finds the user's most-progressed book and recommends similar ones.
    """
    # 1. Find the user's most-progressed book link.
    source_link = db.query(models.UserBookLink).filter(
        models.UserBookLink.user_id == user.id
    ).order_by(models.UserBookLink.progress.desc()).first()

    if not source_link:
        # Fallback: If user has no progress, maybe recommend popular books later.
        # For now, return an empty list.
        return []

    source_book = source_link.book

    # 2. Get IDs of all books the user has in their library to exclude them.
    user_book_ids = {link.book_id for link in user.books_in_library}

    # 3. Get all candidate books, excluding the source and user's library books.
    candidate_books = db.query(models.Book).filter(
        models.Book.id != source_book.id,
        models.Book.id.notin_(user_book_ids)
    ).all()

    # 4. Score the candidate books
    recommendation_scores = []
    for book in candidate_books:
        score = 0
        # Score based on genre match
        if book.genre and book.genre == source_book.genre:
            score += 2
        # Score based on difficulty level
        difficulty_difference = abs(book.difficulty_level - source_book.difficulty_level)
        if difficulty_difference == 0:
            score += 2
        elif difficulty_difference == 1:
            score += 1

        if score > 0:
            recommendation_scores.append((score, book))

    # 5. Sort by score and return the top results
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
    """
    Create a new vocabulary entry for a specific user.
    """
    db_vocab_entry = models.Vocabulary(**vocabulary.model_dump(), user_id=user_id)
    db.add(db_vocab_entry)
    db.commit()
    db.refresh(db_vocab_entry)
    return db_vocab_entry

def get_all_vocabulary(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieves all vocabulary entries.
    """
    return db.query(models.Vocabulary).order_by(models.Vocabulary.created_at.desc()).offset(skip).limit(limit).all()

def get_vocabulary_for_user(db: Session, user_id: UUID):
    """
    Retrieves all vocabulary for a specific user.
    """
    return db.query(models.Vocabulary).filter(models.Vocabulary.user_id == user_id).order_by(models.Vocabulary.created_at.desc()).all()
