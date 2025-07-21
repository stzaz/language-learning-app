import pytest
from datetime import date, timedelta
from uuid import uuid4

# Import your project's modules
from backend import crud, models, schemas

def test_get_user_stats_no_activity(db_session):
    """
    Tests that a user with no reading history has all zero stats.
    """
    # Arrange: Create a user with no activity
    user = models.User(id=uuid4(), email="no_activity@example.com", hashed_password="...")

    # Act
    stats = crud.get_user_stats(db=db_session, user=user)

    # Assert
    assert stats.reading_streak == 0
    assert stats.total_words_learned == 0
    assert stats.total_minutes_read == 0

def test_get_user_stats_continuous_streak(db_session):
    """
    Tests a perfect, multi-day reading streak.
    """
    # Arrange
    user = models.User(id=uuid4(), email="streak@example.com", hashed_password="...")
    today = date.today()
    # Simulate reading for the last 3 days
    user.reading_history = [
        models.ReadingActivity(date=today, minutes_read=10),
        models.ReadingActivity(date=today - timedelta(days=1), minutes_read=15),
        models.ReadingActivity(date=today - timedelta(days=2), minutes_read=20),
    ]
    user.vocabulary = [models.Vocabulary(), models.Vocabulary()] # 2 saved words

    # Act
    stats = crud.get_user_stats(db=db_session, user=user)

    # Assert
    assert stats.reading_streak == 3
    assert stats.total_words_learned == 2
    assert stats.total_minutes_read == 45 # 10 + 15 + 20

def test_get_user_stats_broken_streak(db_session):
    """
    Tests that the streak calculation correctly stops when a day is missed.
    """
    # Arrange
    user = models.User(id=uuid4(), email="broken@example.com", hashed_password="...")
    today = date.today()
    # Simulates reading today and 2 days ago (missed yesterday)
    user.reading_history = [
        models.ReadingActivity(date=today, minutes_read=10),
        models.ReadingActivity(date=today - timedelta(days=2), minutes_read=20),
    ]

    # Act
    stats = crud.get_user_stats(db=db_session, user=user)

    # Assert: The streak should only be 1 because yesterday was missed
    assert stats.reading_streak == 1
    assert stats.total_minutes_read == 30

def test_get_user_stats_streak_ending_yesterday(db_session):
    """
    Tests that the streak is still valid if the last activity was yesterday.
    """
    # Arrange
    user = models.User(id=uuid4(), email="yesterday@example.com", hashed_password="...")
    today = date.today()
    user.reading_history = [
        models.ReadingActivity(date=today - timedelta(days=1), minutes_read=10),
        models.ReadingActivity(date=today - timedelta(days=2), minutes_read=10),
    ]

    # Act
    stats = crud.get_user_stats(db=db_session, user=user)

    # Assert
    assert stats.reading_streak == 2