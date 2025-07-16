from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend import crud, schemas # To create a book for testing

def test_read_books_endpoint(client: TestClient, db_session: Session):
    """
    Test fetching a list of books.
    """
    # First, create a book directly using CRUD to ensure the DB is not empty
    book_in = schemas.BookCreate(
        title="Test Book",
        author="Test Author",
        language="en",
        difficulty_level=1,
        genre="Fiction",
        cover_image_url="http://example.com/cover.jpg",
        progress=0,
        rating=4.5
    )
    crud.create_book(db=db_session, book=book_in)

    response = client.get("/books/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["title"] == "Test Book"
    assert data[0]["author"] == "Test Author"

def test_read_book_endpoint_not_found(client: TestClient):
    """
    Test that fetching a non-existent book returns a 404 error.
    """
    # A random UUID that won't exist
    non_existent_uuid = "123e4567-e89b-12d3-a456-426614174000"
    response = client.get(f"/books/{non_existent_uuid}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Book not found"}