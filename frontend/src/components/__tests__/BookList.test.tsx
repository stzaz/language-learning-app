import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookList from '../BookList';
import * as api from '@/lib/api'; // 1. Import the entire api module
import { Book } from '@/types';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock the AuthProvider as BookCard now uses it
jest.mock('@/providers/AuthProvider', () => ({
    useAuth: () => ({
        token: 'fake-token',
    }),
}));

// 2. Mock the entire API module
jest.mock('@/lib/api');

// Define a mock list of books to use in our tests
const mockBooks: Book[] = [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', language: 'en', difficulty_level: 3 },
    { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', language: 'en', difficulty_level: 2 },
    { id: '3', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', language: 'es', difficulty_level: 5 },
];


describe('BookList Component', () => {

    beforeEach(() => {
        // 3. Clear and reset the mock for getBooks before each test
        (api.getBooks as jest.Mock).mockClear();
    });

    it('should fetch and display the initial list of books', async () => {
        // Arrange
        // 4. Provide a mock implementation for getBooks for this specific test
        (api.getBooks as jest.Mock).mockResolvedValue(mockBooks);

        // Act
        render(<BookList />);

        // Assert
        expect(await screen.findByText(/the great gatsby/i)).toBeInTheDocument();
        expect(screen.getByText(/to kill a mockingbird/i)).toBeInTheDocument();
        expect(screen.getByText(/cien años de soledad/i)).toBeInTheDocument();
    });

    it('should filter books based on search input', async () => {
        // Arrange
        (api.getBooks as jest.Mock).mockResolvedValue(mockBooks);
        render(<BookList />);
        await screen.findByText(/the great gatsby/i);

        // Act
        const searchInput = screen.getByPlaceholderText(/search by title or author/i);
        fireEvent.change(searchInput, { target: { value: 'gatsby' } });

        // Assert
        expect(screen.getByText(/the great gatsby/i)).toBeInTheDocument();
        expect(screen.queryByText(/to kill a mockingbird/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/cien años de soledad/i)).not.toBeInTheDocument();
    });

    it('should filter books based on the language dropdown', async () => {
        // Arrange
        (api.getBooks as jest.Mock).mockResolvedValue(mockBooks);
        render(<BookList />);
        await screen.findByText(/cien años de soledad/i);

        // Act
        const languageSelect = screen.getByRole('combobox');
        fireEvent.change(languageSelect, { target: { value: 'es' } });

        // Assert
        expect(screen.getByText(/cien años de soledad/i)).toBeInTheDocument();
        expect(screen.queryByText(/the great gatsby/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/to kill a mockingbird/i)).not.toBeInTheDocument();
    });
});