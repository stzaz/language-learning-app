from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base # Updated import

# For this example, we'll use SQLite.
# You can replace this with your actual database URL.
SQLALCHEMY_DATABASE_URL = "sqlite:///./backend/language_learning.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

