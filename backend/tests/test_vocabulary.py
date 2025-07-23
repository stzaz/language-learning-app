from fastapi.testclient import TestClient
import json

def test_create_and_read_vocabulary_entry(client: TestClient):
    """
    Tests creating a vocabulary entry for an authenticated user and then fetching it.
    """
    # Step 1: Create a user
    user_response = client.post(
        "/users/",
        json={"email": "vocab_user@example.com", "password": "testpassword"},
    )
    assert user_response.status_code == 200
    user_id = user_response.json()["id"]

    # Step 2: Log in to get a token
    login_response = client.post(
        "/token",
        data={"username": "vocab_user@example.com", "password": "testpassword"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Step 3: Use the token to create a vocabulary entry
    headers = {"Authorization": f"Bearer {token}"}
    vocab_data = {
        "word": "biblioteca",
        "definition": json.dumps({
            "definition": "A building or room containing collections of books.",
            "part_of_speech": "noun",
            "translation": "library",
        }),
        "context_sentence": "La biblioteca está abierta."
    }
    
    create_response = client.post("/vocabulary/", json=vocab_data, headers=headers)
    assert create_response.status_code == 200
    created_entry = create_response.json()
    assert created_entry["word"] == "biblioteca"
    assert created_entry["user_id"] == user_id

    # --- STEP 4 (CORRECTED) ---
    # Fetch the full user data from the secure /users/me endpoint
    read_response = client.get("/users/me/", headers=headers)
    assert read_response.status_code == 200
    
    # The vocabulary list is now nested inside the user object
    user_data = read_response.json()
    read_data = user_data["vocabulary"]
    
    assert isinstance(read_data, list)
    assert len(read_data) == 1
    assert read_data[0]["word"] == "biblioteca"


def test_create_vocabulary_entry_unauthorized(client: TestClient):
    """
    Tests that creating a vocabulary entry fails without a valid token.
    """
    # ... (This test is still correct and does not need to be changed)
    vocab_data = {
        "word": "unauthorized_word",
        "definition": "{}",
        "context_sentence": "This should not be saved."
    }
    response = client.post("/vocabulary/", json=vocab_data)
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}