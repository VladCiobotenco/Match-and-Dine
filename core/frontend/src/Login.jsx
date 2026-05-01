import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Te rog să completezi ambele câmpuri!');
      return;
    }

    setIsLoading(true);

    try {
      const payload = { 
        email: email.trim().toLowerCase(), 
        password, 
      };

      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      // Parse JSON only when available; otherwise report a server error
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error(`Eroare Server: ${response.status} ${response.statusText}`);
      }

      if (response.ok) {
        console.log("Login successful:", data);
        // SALVĂM STAREA DE OWNER ÎN MEMORIE
        localStorage.setItem('token', data.token);
        localStorage.setItem('isOwner', data.isOwner);
        localStorage.setItem('userEmail', data.email);
        navigate('/home');
      } else {
        setError(data.error || 'A apărut o eroare la conectare.');
      }
    } catch (err) {
      setError(err.message || 'A apărut o eroare la conectare. Încearcă din nou.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Match & Dine</h1>
      <h2>Autentificare</h2>

      <form onSubmit={handleLogin}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email" type="email" placeholder="Introdu adresa de email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading} autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Parolă</label>
          <div className="password-container">
            <input 
              id="password" type={showPassword ? 'text' : 'password'} placeholder="Introdu parola"
              value={password} onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading} autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
              {showPassword ? 'Ascunde' : 'Arată'}
            </button>
          </div>
        </div>

        <div className="input-group checkbox-group">
          <label>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading} />
            Ține-mă minte
          </label>
        </div>

        <div className="forgot-password">
          <Link to="/forgot-password">Ai uitat parola?</Link>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Se încarcă...' : 'Intră în cont'}
        </button>

        <div className="register-link">
          Nu ai cont? <Link to="/register">Înregistrează-te</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;