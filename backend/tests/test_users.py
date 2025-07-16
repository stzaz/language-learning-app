from fastapi.testclient import TestClient

# We don't need to import db_session here because pytest handles it automatically.

def test_register_user(client: TestClient):
    """
    Test creating a new user successfully.
    """
    response = client.post(
        "/users/",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    # The hashed_password should NOT be returned
    assert "hashed_password" not in data

def test_register_existing_user_fails(client: TestClient):
    """
    Test that registering a user with an existing email fails.
    """
    # First, create a user
    client.post(
        "/users/",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    
    # Then, try to create the same user again
    response = client.post(
        "/users/",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Email already registered"}

def test_login_for_access_token(client: TestClient):
    """
    Test logging in and receiving a JWT access token.
    """
    # First, create a user to log in with
    client.post(
        "/users/",
        json={"email": "testlogin@example.com", "password": "testpassword"},
    )
    
    # Now, log in
    response = client.post(
        "/token",
        data={"username": "testlogin@example.com", "password": "testpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_with_wrong_password_fails(client: TestClient):
    """
    Test that logging in with an incorrect password fails.
    """
    client.post(
        "/users/",
        json={"email": "testlogin@example.com", "password": "testpassword"},
    )
    
    response = client.post(
        "/token",
        data={"username": "testlogin@example.com", "password": "wrongpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect email or password"}