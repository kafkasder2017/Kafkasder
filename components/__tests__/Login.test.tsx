import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';

// Mock Supabase
jest.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<Login onLogin={mockOnLogin} />);
    
    expect(screen.getByText('KAFKASDER')).toBeInTheDocument();
    expect(screen.getByText('Yönetim Paneline Giriş')).toBeInTheDocument();
    expect(screen.getByLabelText('E-posta Adresi')).toBeInTheDocument();
    expect(screen.getByLabelText('Şifre')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('allows user to type in email and password fields', async () => {
    const user = userEvent.setup();
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('E-posta Adresi');
    const passwordInput = screen.getByLabelText('Şifre');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls onLogin when form is submitted with valid data', async () => {
    const user = userEvent.setup();
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('E-posta Adresi');
    const passwordInput = screen.getByLabelText('Şifre');
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows loading state when form is submitted', async () => {
    const user = userEvent.setup();
    const slowOnLogin = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<Login onLogin={slowOnLogin} />);
    
    const emailInput = screen.getByLabelText('E-posta Adresi');
    const passwordInput = screen.getByLabelText('Şifre');
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});