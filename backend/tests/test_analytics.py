from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend import models
import uuid # 1. Import the uuid library

def test_log_event_success(client: TestClient, db_session: Session):
    """
    Tests that a generic event can be successfully logged for an authenticated user.
    """
    # 1. Arrange: Create a user and log them in
    email = "analytics-user@example.com"
    password = "testpassword"
    user_response = client.post("/users/", json={"email": email, "password": password})
    user_id_str = user_response.json()["id"] # Get user ID as string
    
    login_response = client.post("/token", data={"username": email, "password": password})
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Define the event payload
    event_data = {
        "event_name": "recommendation_clicked",
        "properties": {
            "book_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "book_title": "Test Book"
        }
    }

    # 2. Act: Make the API call
    response = client.post("/events/log", headers=headers, json=event_data)

    # 3. Assert: Check the response
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["event_name"] == "recommendation_clicked"
    assert response_data["user_id"] == user_id_str
    assert response_data["properties"]["book_title"] == "Test Book"

    # --- THIS IS THE CORRECTED PART ---
    # 4. Verify that the event was actually saved to the database
    # Convert the string ID from the response back to a UUID object
    event_id_from_response = uuid.UUID(response_data["id"])
    
    db_event = db_session.query(models.Event).filter(models.Event.id == event_id_from_response).first()
    
    assert db_event is not None
    assert str(db_event.user_id) == user_id_str
    assert db_event.properties["book_id"] == "a1b2c3d4-e5f6-7890-1234-567890abcdef"