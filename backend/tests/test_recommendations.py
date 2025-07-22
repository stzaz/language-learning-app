from uuid import uuid4
from backend import crud, models

def test_get_user_recommendations_success(db_session):
    """
    Tests that a user receives relevant recommendations based on their most-progressed book,
    and that books already in their library are excluded.
    """
    # 1. Arrange: Create a user and some books
    user = models.User(id=uuid4(), email="rec-user@example.com", hashed_password="...")
    
    book1 = models.Book(id=uuid4(), title="Source Book", author="Author A", language="en", difficulty_level=3, genre="Sci-Fi")
    book2 = models.Book(id=uuid4(), title="Good Recommendation", author="Author B", language="en", difficulty_level=3, genre="Sci-Fi")
    book3 = models.Book(id=uuid4(), title="Okay Recommendation", author="Author C", language="en", difficulty_level=2, genre="Sci-Fi")
    book4 = models.Book(id=uuid4(), title="Bad Recommendation", author="Author D", language="en", difficulty_level=5, genre="History")
    book5 = models.Book(id=uuid4(), title="Already Read Book", author="Author E", language="en", difficulty_level=3, genre="Sci-Fi")

    db_session.add_all([user, book1, book2, book3, book4, book5])
    db_session.commit()

    # Create user-book links to simulate a personal library
    # The user has made the most progress in book1.
    link1 = models.UserBookLink(user_id=user.id, book_id=book1.id, progress=75)
    # The user has already read book5.
    link2 = models.UserBookLink(user_id=user.id, book_id=book5.id, progress=100)
    
    db_session.add_all([link1, link2])
    db_session.commit()
    db_session.refresh(user)

    # 2. Act: Get recommendations for the user
    recommendations = crud.get_user_recommendations(db=db_session, user=user, limit=3)

    # 3. Assert
    assert len(recommendations) == 2  # Should return 2 valid recommendations
    
    # The best recommendation should be book2 (exact match on genre and difficulty)
    assert recommendations[0].id == book2.id
    
    # The second best should be book3 (match on genre, close on difficulty)
    assert recommendations[1].id == book3.id
    
    # book4 should not be recommended (bad score)
    # book5 should not be recommended (already in library)
    book_ids = {book.id for book in recommendations}
    assert book4.id not in book_ids
    assert book5.id not in book_ids


def test_get_user_recommendations_no_history(db_session):
    """
    Tests that a user with no reading history receives an empty list of recommendations.
    """
    # 1. Arrange: Create a user with no books in their library
    user = models.User(id=uuid4(), email="new-user@example.com", hashed_password="...")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # 2. Act
    recommendations = crud.get_user_recommendations(db=db_session, user=user)

    # 3. Assert
    assert recommendations == []