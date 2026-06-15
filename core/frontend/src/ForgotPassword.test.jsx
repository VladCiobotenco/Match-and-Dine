import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

describe('Teste pentru componenta ForgotPassword', () => {
  it('Afișează input-ul de email și butonul de submit', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/Emailul contului/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trimite link-ul/i })).toBeInTheDocument();
  });

  it('Afișează eroare dacă emailul nu este completat', async () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    const button = screen.getByRole('button', { name: /Trimite link-ul/i });
    fireEvent.click(button);
    
    expect(await screen.findByText('Te rog să introduci o adresă de email.')).toBeInTheDocument();
  });
});