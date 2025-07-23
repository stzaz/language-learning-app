# backend/tests/test_recommendations.py
from uuid import uuid4
from backend import crud, models

# Helper function to create a book with a specific vocabulary
def create_book_with_words(db_session, title, language, difficulty, words):
    book = models.Book(id=uuid4(), title=title, author="Author", language=language, difficulty_level=difficulty)
    for word_text in words:
        word = db_session.query(models.Word).filter_by(text=word_text, language=language).first()
        if not word:
            word = models.Word(text=word_text, language=language)
            db_session.add(word)
        book.unique_words.append(word)
    db_session.add(book)
    db_session.commit()
    return book

# Helper function to add words to a user's vocabulary
def add_vocabulary_to_user(db_session, user, words):
    for word_text in words:
        vocab_entry = models.Vocabulary(
            word=word_text, 
            definition="{}", 
            context_sentence="...",
            owner=user
        )
        user.vocabulary.append(vocab_entry)
    db_session.commit()

def test_recommendations_for_new_user_cold_start(db_session):
    """
    Tests the "cold start" scenario: A user with no vocabulary should be recommended the easiest books.
    """
    # 1. Arrange: Create a user with no vocabulary
    user = models.User(id=uuid4(), email="newbie@example.com", hashed_password="...")
    db_session.add(user)
    db_session.commit()

    # Create books with varying difficulty
    create_book_with_words(db_session, "Hard Book", "en", 5, {"d", "e", "f"})
    book_easy2 = create_book_with_words(db_session, "Easy Book 2", "en", 2, {"g", "h", "i"})
    book_easy1 = create_book_with_words(db_session, "Easy Book 1", "en", 1, {"a", "b", "c"})
    
    # 2. Act: Get recommendations
    recommendations = crud.get_user_recommendations(db=db_session, user=user)

    # 3. Assert: The easiest books should be returned, in order of difficulty
    assert len(recommendations) == 3
    assert recommendations[0].id == book_easy1.id
    assert recommendations[1].id == book_easy2.id

def test_recommendations_with_vocabulary_coverage(db_session):
    """
    Tests that recommendations are correctly scored and ranked based on the 98% "comprehensible input" rule.
    """
    # 1. Arrange: Create a user and their known vocabulary
    user = models.User(id=uuid4(), email="learner@example.com", hashed_password="...")
    db_session.add(user)
    # This user knows 95 out of a possible 100 base words, plus some others
    user_words = {f"word{i}" for i in range(95)} | {"extra1", "extra2"}
    add_vocabulary_to_user(db_session, user, user_words)

    # 2. Arrange: Create books with different vocabulary sets
    # Optimal Book: 95/100 words known = 95% coverage (very close to 98%)
    optimal_book_words = {f"word{i}" for i in range(100)}
    optimal_book = create_book_with_words(db_session, "Optimal Book", "en", 3, optimal_book_words)

    # Good Book: 80/100 words known = 80% coverage
    good_book_words = {f"word{i}" for i in range(80)} | {f"new_word{i}" for i in range(20)}
    good_book = create_book_with_words(db_session, "Good Book", "en", 3, good_book_words)

    # Bad Book: 5/100 words known = 5% coverage
    bad_book_words = {f"word{i}" for i in range(5)} | {f"unseen{i}" for i in range(95)}
    create_book_with_words(db_session, "Bad Book", "en", 3, bad_book_words)

    # Perfect Match (but in library): 95/95 words known = 100% coverage
    library_book_words = {f"word{i}" for i in range(95)}
    library_book = create_book_with_words(db_session, "Library Book", "en", 3, library_book_words)

    # Add one book to the user's library to ensure it's excluded
    user.books_in_library.append(models.UserBookLink(user=user, book=library_book))
    db_session.commit()

    # 3. Act: Get recommendations for the user
    recommendations = crud.get_user_recommendations(db=db_session, user=user)

    # 4. Assert
    assert len(recommendations) == 3
    # The first recommendation should be the one closest to 98%
    assert recommendations[0].id == optimal_book.id 
    # The second should be the next closest
    assert recommendations[1].id == good_book.id
    # The "Library Book" should not be in the list, even though it has 100% coverage
    recommended_ids = {rec.id for rec in recommendations}
    assert library_book.id not in recommended_ids