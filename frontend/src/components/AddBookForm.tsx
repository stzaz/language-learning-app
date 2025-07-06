import React, { useState, FormEvent } from 'react';

const AddBookForm: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [language, setLanguage] = useState<string>('');
    const [difficultyLevel, setDifficultyLevel] = useState<string>('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const bookData = {
            title,
            author,
            language,
            difficulty_level: parseInt(difficultyLevel, 10),
        };

        if (isNaN(bookData.difficulty_level)) {
            console.error("Difficulty level must be a number.");
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/books/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(result)}`);
            }

            console.log('Book created successfully:', result);

            // Clear the form after successful submission
            setTitle('');
            setAuthor('');
            setLanguage('');
            setDifficultyLevel('');

        } catch (error) {
            console.error('Error creating book:', error);
        }
    };

    return (
        <div>
            <h2>Add a New Book</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title:</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="author">Author:</label>
                    <input
                        id="author"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="language">Language (e.g., `es`):</label>
                    <input
                        id="language"
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="difficulty_level">Difficulty Level:</label>
                    <input
                        id="difficulty_level"
                        type="number"
                        value={difficultyLevel}
                        onChange={(e) => setDifficultyLevel(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Add Book</button>
            </form>
        </div>
    );
};

export default AddBookForm;

