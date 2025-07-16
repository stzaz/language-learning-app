import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# --- Import your project's modules ---
from backend.main import app
from backend.database import Base, get_db

# --- Test Database Configuration ---
# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Fixture to set up and tear down the database ---
@pytest.fixture(scope="function")
def db_session():
    """
    Create a new database session for each test.
    This ensures tests are isolated from each other.
    """
    Base.metadata.create_all(bind=engine)  # Create tables
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)  # Drop tables after test

# --- Fixture to provide a test client ---
@pytest.fixture(scope="function")
def client(db_session):
    """
    Create a FastAPI TestClient that uses the test database.
    """
    def override_get_db():
        """
        A dependency override that provides the test database session.
        """
        try:
            yield db_session
        finally:
            db_session.close()
    
    # Apply the override
    app.dependency_overrides[get_db] = override_get_db
    
    yield TestClient(app)
    
    # Clean up the override after tests are done
    del app.dependency_overrides[get_db]