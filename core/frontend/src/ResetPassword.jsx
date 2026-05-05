import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './App.css';

function ResetPassword() {
  // Extragem token-urile din URL
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parolele nu coincid!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/password-reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Parola a fost actualizată cu succes! Vei fi redirecționat către login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Link-ul este invalid sau a expirat.');
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
      <h2>Alege o nouă parolă</h2>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: 'green', marginBottom: '15px', fontWeight: '500', fontSize: '0.9rem' }}>{message}</div>}
        
        <div className="input-group">
          <label htmlFor="password">Noua parolă</label>
          <input id="password" type="password" placeholder="Crează o parolă" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading || message} />
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirmă parola</label>
          <input id="confirmPassword" type="password" placeholder="Repetă parola" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading || message} />
        </div>

        {!message && (
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Se salvează...' : 'Actualizează Parola'}
          </button>
        )}
        
        <div className="register-link" style={{ marginTop: '20px' }}>
          <Link to="/login">Mergi la Autentificare</Link>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;