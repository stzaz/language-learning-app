from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import uuid
from backend import models

def test_srs_flow(client: TestClient, db_session: Session):
    """
    Tests the full SRS flow...
    """
    # 1. Arrange: Create a user and log them in
    email = "srs-user@example.com"
    password = "testpassword"
    client.post("/users/", json={"email": email, "password": password})
    login_response = client.post("/token", data={"username": email, "password": password})
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Arrange: Create vocabulary words
    word1_res = client.post("/vocabulary/", headers=headers, json={"word": "word1", "definition": "{}", "context_sentence": "..."})
    word2_res = client.post("/vocabulary/", headers=headers, json={"word": "word2", "definition": "{}", "context_sentence": "..."})
    
    # --- 2. CONVERT STRING IDs TO UUID OBJECTS ---
    word1_id = uuid.UUID(word1_res.json()["id"])
    word2_id = uuid.UUID(word2_res.json()["id"])

    # 3. Arrange: Manually update the database records
    utc_now = datetime.now(timezone.utc)
    word1_db = db_session.query(models.Vocabulary).filter(models.Vocabulary.id == word1_id).first()
    word2_db = db_session.query(models.Vocabulary).filter(models.Vocabulary.id == word2_id).first()

    word1_db.next_review_at = utc_now - timedelta(days=1)
    word2_db.next_review_at = utc_now + timedelta(days=1)
    db_session.commit()

    # 4. Act & Assert: Fetch words due for review
    due_response = client.get("/vocabulary/due-for-review", headers=headers)
    assert due_response.status_code == 200
    due_words = due_response.json()
    assert len(due_words) == 1
    
    # --- CONVERT THIS ID FOR THE NEXT API CALL ---
    due_word_id = uuid.UUID(due_words[0]["id"])
    original_interval = due_words[0]["interval"]

    # 5. Act & Assert: Submit a good review for the due word
    review_response = client.post(
        f"/vocabulary/{due_word_id}/review",
        headers=headers,
        json={"performance_rating": 5}
    )
    assert review_response.status_code == 200
    updated_word = review_response.json()
    
    # First, parse the naive datetime string from the JSON response
    next_review_naive = datetime.fromisoformat(updated_word["next_review_at"])
    # Then, make it timezone-aware by attaching the UTC timezone
    next_review_aware = next_review_naive.replace(tzinfo=timezone.utc)

    assert updated_word["interval"] > original_interval
    assert next_review_aware > datetime.now(timezone.utc) # Now we can compare them


    # 6. Act & Assert: Fetch due words again
    due_response_after = client.get("/vocabulary/due-for-review", headers=headers)
    assert due_response_after.status_code == 200
    assert len(due_response_after.json()) == 0