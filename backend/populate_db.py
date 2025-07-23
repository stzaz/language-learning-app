# backend/populate_db.py
import sys
import os
import re
from sqlalchemy.orm import Session
from typing import Set

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import Base, Book, BookContent, Word # 1. Import the new Word model

# --- Configuration for Books to Add ---
books_to_add = [
    {
        "title": "La alhambra; leyendas árabes",
        "author": "Manuel Fernández y González",
        "language": "es",
        "difficulty_level": 3,
        "genre": "Historical Fiction",
        "cover_image_url": "https://picsum.photos/seed/alhambra/400/600",
        "rating": 4.7,
        "file_path": "backend/alhambra.txt",
    },
    {
        "title": "Aesop's Fables",
        "author": "Aesop",
        "language": "en",
        "difficulty_level": 1,
        "genre": "Fable",
        "cover_image_url": "https://picsum.photos/seed/aesop/400/600",
        "rating": 4.9,
        "file_path": "backend/aesop.txt",
    },
    {
        "title": "Boule de Suif",
        "author": "Guy de Maupassant",
        "language": "fr",
        "difficulty_level": 4,
        "genre": "Short Story",
        "cover_image_url": "https://picsum.photos/seed/maupassant/400/600",
        "rating": 4.8,
        "file_path": "backend/boule-de-suif.txt",
    },
]

# --- NEW: Text Normalization and Word Extraction Function ---
def normalize_and_extract_words(text: str) -> Set[str]:
    """
    Normalizes text by converting to lowercase, removing punctuation,
    and returns a set of unique words.
    """
    # Convert to lowercase
    text = text.lower()
    # Find all sequences of word characters (alphanumeric)
    words = re.findall(r'\b[a-z\']+\b', text)
    return set(words)


def parse_and_add_content(db: Session, book_record: Book, file_path: str):
    """
    Parses a text file, adds its content as paragraphs, and analyzes its unique vocabulary.
    """
    print(f"Opening '{file_path}' to populate content for '{book_record.title}'...")
    full_text_content = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            in_content_section = False
            paragraph_buffer = []
            paragraph_index = 0

            for line in f:
                stripped_line = line.strip()

                if '*** START OF THE PROJECT GUTENBERG EBOOK' in stripped_line.upper():
                    in_content_section = True
                    paragraph_buffer = []
                    continue

                if '*** END OF THE PROJECT GUTENBERG EBOOK' in stripped_line.upper():
                    break

                if not in_content_section:
                    continue

                if not stripped_line:
                    if paragraph_buffer:
                        full_paragraph = " ".join(paragraph_buffer)
                        if len(full_paragraph) >= 20:
                            book_content = BookContent(
                                book_id=book_record.id,
                                paragraph_index=paragraph_index,
                                original_text=full_paragraph,
                                translated_text="[Translation not available]"
                            )
                            db.add(book_content)
                            full_text_content.append(full_paragraph) # Store for analysis
                            paragraph_index += 1
                        paragraph_buffer = []
                else:
                    paragraph_buffer.append(stripped_line)

            if in_content_section and paragraph_buffer:
                full_paragraph = " ".join(paragraph_buffer)
                if len(full_paragraph) >= 20:
                    book_content = BookContent(
                        book_id=book_record.id,
                        paragraph_index=paragraph_index,
                        original_text=full_paragraph,
                        translated_text="[Translation not available]"
                    )
                    db.add(book_content)
                    full_text_content.append(full_paragraph) # Store for analysis
                    paragraph_index += 1

            if paragraph_index > 0:
                print(f"Successfully added {paragraph_index} paragraphs to '{book_record.title}'.")
            else:
                 print(f"Warning: No paragraphs were found for '{book_record.title}'. Check the markers in the file.")

        # --- NEW: Vocabulary Analysis Pipeline ---
        if full_text_content:
            print(f"Analyzing unique vocabulary for '{book_record.title}'...")
            combined_text = " ".join(full_text_content)
            unique_words = normalize_and_extract_words(combined_text)
            print(f"Found {len(unique_words)} unique words.")

            for word_text in unique_words:
                # Check if word already exists in the master list for this language
                db_word = db.query(Word).filter(Word.text == word_text, Word.language == book_record.language).first()
                if not db_word:
                    # If it doesn't exist, create it
                    db_word = Word(text=word_text, language=book_record.language)
                    db.add(db_word)
                
                # Link the word to the book
                book_record.unique_words.append(db_word)
            
            print(f"Finished linking vocabulary for '{book_record.title}'.")


    except FileNotFoundError:
        print(f"Error: '{file_path}' not found. Skipping this book.")
    except Exception as e:
        print(f"An error occurred while parsing {file_path}: {e}")
        db.rollback()


def populate_database():
    """
    Populates the database with books, their content, and their vocabulary.
    """
    # Ensure all tables are created, including the new Word and BookWordLink tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        for book_data in books_to_add:
            # Check if the book already exists
            existing_book = db.query(Book).filter(Book.title == book_data["title"]).first()
            if existing_book:
                print(f"Book '{book_data['title']}' already exists. Deleting and recreating.")
                db.delete(existing_book)
                db.commit()

            # Create a new book record
            file_path = book_data.pop("file_path") # Remove file_path before creating Book
            new_book = Book(**book_data)
            db.add(new_book)
            db.commit()
            db.refresh(new_book)
            print(f"Created book record for: '{new_book.title}'")

            # Parse the text file and add its content and vocabulary
            parse_and_add_content(db, new_book, file_path)
            db.commit()

        print("\nDatabase population complete.")
    except Exception as e:
        print(f"A critical error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()