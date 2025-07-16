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
    assert created_entry["context_sentence"] == "La biblioteca está abierta."
    assert created_entry["user_id"] == user_id

    # Step 4: Fetch the vocabulary for that specific user
    read_response = client.get(f"/vocabulary/{user_id}")
    assert read_response.status_code == 200
    read_data = read_response.json()
    assert isinstance(read_data, list)
    assert len(read_data) == 1
    assert read_data[0]["word"] == "biblioteca"


def test_create_vocabulary_entry_unauthorized(client: TestClient):
    """
    Tests that creating a vocabulary entry fails without a valid token.
    """
    vocab_data = {
        "word": "unauthorized_word",
        "definition": "{}",
        "context_sentence": "This should not be saved."
    }
    
    # Make the request without the Authorization header
    response = client.post("/vocabulary/", json=vocab_data)
    
    # FastAPI returns a 401 Unauthorized error
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}