import sys
import os

# Add the project root directory to the Python path.
# This allows the script to find the 'backend' module for imports.
# os.path.abspath(__file__) gets the absolute path to this script.
# os.path.dirname() is used twice to go up two levels from the script's location
# (backend/populate_db.py) to the project root.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# This script is intended to be run from the project's root directory.
# Example: python backend/populate_db.py
from backend.database import SessionLocal, engine
from backend.models import Base, Book, BookContent

# Create tables if they don't exist. This is useful for the first run.
# In a real application, you might handle migrations with a tool like Alembic.
Base.metadata.create_all(bind=engine)


def populate_database():
    """
    Populates the database with a book and its content from a text file.
    This version reads the file line-by-line to be memory-efficient.
    """
    db = SessionLocal()

    try:
        # For idempotency, clean up existing data for this specific book
        book_to_delete = db.query(Book).filter(Book.title == "La alhambra; leyendas árabes").first()
        if book_to_delete:
            print(f"Deleting existing book and content for '{book_to_delete.title}'...")
            db.delete(book_to_delete)
            db.commit()
            print("Deletion complete.")

        # 1. Create a new Book record
        new_book = Book(
            title="La alhambra; leyendas árabes",
            author="Manuel Fernández y González",
            language="es",
            difficulty_level=3
        )
        db.add(new_book)
        db.commit()
        db.refresh(new_book)
        print(f"Created book: '{new_book.title}' with ID: {new_book.id}")

        # 2. Open and read the local text file
        file_path = "backend/alhambra.txt"
        print(f"Opening '{file_path}' to populate book content...")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                in_content_section = False
                paragraph_buffer = []
                paragraph_index = 0

                for line in f:
                    # We use the raw line to detect paragraph breaks accurately
                    stripped_line = line.strip()

                    if '*** START OF THE PROJECT GUTENBERG EBOOK' in stripped_line.upper():
                        in_content_section = True
                        # Clear buffer in case of junk before the start marker
                        paragraph_buffer = []
                        continue

                    if '*** END OF THE PROJECT GUTENBERG EBOOK' in stripped_line.upper():
                        break  # End of content section

                    if not in_content_section:
                        continue

                    # Inside the content section
                    if not stripped_line:
                        # An empty line signifies a paragraph break.
                        # Process the buffer if it contains text.
                        if paragraph_buffer:
                            full_paragraph = " ".join(paragraph_buffer)
                            # Filter out short paragraphs/headings
                            if len(full_paragraph) >= 20:
                                book_content = BookContent(
                                    book_id=new_book.id,
                                    paragraph_index=paragraph_index,
                                    original_text=full_paragraph,
                                    translated_text="[Translation not available]"
                                )
                                db.add(book_content)
                                paragraph_index += 1
                            # Reset buffer for the next paragraph
                            paragraph_buffer = []
                    else:
                        # Line has content, add it to the buffer
                        paragraph_buffer.append(stripped_line)
                
                # After the loop, process any remaining content in the buffer.
                # This handles the very last paragraph before the "END" marker.
                if in_content_section and paragraph_buffer:
                    full_paragraph = " ".join(paragraph_buffer)
                    if len(full_paragraph) >= 20:
                        book_content = BookContent(
                            book_id=new_book.id,
                            paragraph_index=paragraph_index,
                            original_text=full_paragraph,
                            translated_text="[Translation not available]"
                        )
                        db.add(book_content)
                        paragraph_index += 1

        except FileNotFoundError:
            print(f"Error: '{file_path}' not found. Make sure it's in the correct location.")
            db.rollback()
            return

        if paragraph_index == 0 and not in_content_section:
            print("Warning: No paragraphs were found. Check the start/end markers in the file.")
            db.rollback()
            return

        db.commit()
        print(f"Added {paragraph_index} paragraphs to the book '{new_book.title}'.")
        print("Database population complete.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    populate_database()