import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';
import { useAuth } from '../../providers/AuthProvider';
import { usePathname } from 'next/navigation';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock the entire AuthProvider module
jest.mock('../../providers/AuthProvider', () => ({
    useAuth: jest.fn(),
}));

describe('Header Component', () => {

    beforeEach(() => {
        // Reset mocks before each test for isolation
        (useAuth as jest.Mock).mockClear();
        (usePathname as jest.Mock).mockClear();
    });

    it('renders the login link when no user is authenticated', () => {
        // Arrange
        (usePathname as jest.Mock).mockReturnValue('/');
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            // Provide all values from the context, even if null
            logout: jest.fn(),
        });

        // Act
        render(<Header />);

        // Assert
        expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument();
    });

    it('renders the username and logout button when a user is authenticated', () => {
        // Arrange
        // FIXED: The user object should have a 'username' property, not 'email'.
        const mockUser = { username: 'testuser' };
        (usePathname as jest.Mock).mockReturnValue('/');
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
            // FIXED: The function name should be 'logout' (lowercase).
            logout: jest.fn(),
        });

        // Act
        render(<Header />);

        // Assert
        // FIXED: The test should look for the username in the welcome message.
        expect(screen.getByText(/welcome, testuser/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /log in/i })).not.toBeInTheDocument();
    });

    it('renders nothing on login or register pages', () => {
        // Arrange
        (usePathname as jest.Mock).mockReturnValue('/login');
        (useAuth as jest.Mock).mockReturnValue({ user: null, logout: jest.fn() });

        // Act
        const { container } = render(<Header />);

        // Assert
        // The component should return null, so the container should be empty.
        expect(container.firstChild).toBeNull();
    });
});
