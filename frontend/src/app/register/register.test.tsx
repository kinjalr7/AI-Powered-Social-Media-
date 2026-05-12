import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RegisterPage from './page';
import { authService } from '@/services/api';

vi.mock('@/services/api', () => ({
  authService: {
    register: vi.fn(),
  },
}));

describe('RegisterPage', () => {
  it('renders registration form', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(<RegisterPage />);
    
    fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), {
      target: { value: 'test@example.com' },
    });
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'pass1' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'pass2' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('calls authService.register on successful submission', async () => {
    vi.mocked(authService.register).mockResolvedValueOnce({ data: {} } as any);
    
    render(<RegisterPage />);
    
    fireEvent.change(screen.getByPlaceholderText(/name@company.com/i), {
      target: { value: 'test@example.com' },
    });
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.getByText(/Account created successfully/i)).toBeInTheDocument();
    });
  });
});
