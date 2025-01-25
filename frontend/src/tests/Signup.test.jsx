import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUpPage from '../pages/SignUpPage';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn()
  }
}));

describe('SignUpPage', () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup mock return values
    useAuthStore.mockReturnValue({
      signup: mockSignup,
      isSigningUp: false
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );
  };

  it('renders signup form correctly', () => {
    renderComponent();

    const createAccountText = screen.queryAllByText('Create Account')
    .find(el => !el.closest('button'));
  
    expect(createAccountText).toBeInTheDocument();
    expect(screen.getByText('Get started with your free account')).toBeInTheDocument();
  
  });


  describe('form validation', () => {
    it('shows error for empty full name', () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Full name is required');
    });

   

    it('shows error for short password', () => {
      renderComponent();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '12345' } });
      fireEvent.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Password must be at least 6 characters');
    });

    it('calls signup with form data when validation passes', async () => {
      renderComponent();

      const fullNameInput = screen.getByPlaceholderText('John Doe');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith({
          fullName: 'John Doe',
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });
  });

  it('disables submit button during signup', () => {
    useAuthStore.mockReturnValue({
      signup: mockSignup,
      isSigningUp: true
    });

    renderComponent();

    const submitButton = screen.getByRole('button', { name: /loading/i });
    expect(submitButton).toBeDisabled();
  });
});