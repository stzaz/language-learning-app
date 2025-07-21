import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookList from '../BookList';
import { Book } from '../BookList'; // Import the type from the component file for consistency

// Mock the next/link component, as we don't need its real functionality here
jest.mock('next/link', () => {
    // Give the mock component a name, e.g., "MockLink"
    function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    }
    return MockLink;
});

// Define a mock list of books to use in our tests
const mockBooks: Book[] = [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', language: 'en', difficulty_level: 3 },
    { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', language: 'en', difficulty_level: 2 },
    { id: '3', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', language: 'es', difficulty_level: 5 },
];

// Mock the global fetch function before each test runs
beforeEach(() => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockBooks),
        })
    ) as jest.Mock;
});

// Clear the mock after each test to ensure isolation
afterEach(() => {
    jest.clearAllMocks();
});


describe('BookList Component', () => {
    it('should fetch and display the initial list of books', async () => {
        // Arrange & Act
        render(<BookList />);

        // Assert: We must "await" the result because the fetch is asynchronous.
        // findByText waits for the element to appear.
        expect(await screen.findByText(/the great gatsby/i)).toBeInTheDocument();
        expect(screen.getByText(/to kill a mockingbird/i)).toBeInTheDocument();
        expect(screen.getByText(/cien años de soledad/i)).toBeInTheDocument();
    });

    it('should filter books based on search input', async () => {
        // 1. Arrange: Render the component
        render(<BookList />);
        // Wait for the initial books to load before trying to interact with the page
        await screen.findByText(/the great gatsby/i);

        // 2. Act: Find the search input and simulate a user typing "gatsby"
        const searchInput = screen.getByPlaceholderText(/search by title or author/i);
        fireEvent.change(searchInput, { target: { value: 'gatsby' } });

        // 3. Assert: Check which books are visible after filtering
        expect(screen.getByText(/the great gatsby/i)).toBeInTheDocument();
        expect(screen.queryByText(/to kill a mockingbird/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/cien años de soledad/i)).not.toBeInTheDocument();
    });

    it('should filter books based on the language dropdown', async () => {
        // 1. Arrange
        render(<BookList />);
        // Wait for the books to load so the dropdown is populated
        await screen.findByText(/cien años de soledad/i);

        // 2. Act: Find the language select dropdown and change its value to "es"
        const languageSelect = screen.getByRole('combobox');
        fireEvent.change(languageSelect, { target: { value: 'es' } });

        // 3. Assert
        expect(screen.getByText(/cien años de soledad/i)).toBeInTheDocument();
        expect(screen.queryByText(/the great gatsby/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/to kill a mockingbird/i)).not.toBeInTheDocument();
    });
});
