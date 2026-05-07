import { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Te rog să introduci o adresă de email.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Link-ul de resetare a fost trimis!');
        setEmail('');
      } else {
        setError(data.error || 'A apărut o eroare. Încearcă din nou.');
      }
    } catch (err) {
      setError('Eroare de conexiune cu serverul.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ margin: '40px auto' }}>
      <h1>Match & Dine</h1>
      <h2>Resetare Parolă</h2>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: 'green', marginBottom: '15px', fontWeight: '500', fontSize: '0.9rem' }}>{message}</div>}
        
        <div className="input-group">
          <label htmlFor="email">Emailul contului</label>
          <input id="email" type="email" placeholder="Introdu adresa de email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Se trimite...' : 'Trimite link-ul'}
        </button>

        <div className="register-link">
          Ți-ai amintit parola? <Link to="/login">Întoarce-te la Autentificare</Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;