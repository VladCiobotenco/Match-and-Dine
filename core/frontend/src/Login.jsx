import { useState } from 'react';
import './App.css';

function Login() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
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

      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        // TODO: Redirect user (e.g., using React Router's useNavigate hook)
        // navigate('/home');
      } else {
        setError(data.error || 'A apărut o eroare la conectare.');
      }
    } catch (err) {
      setError('A apărut o eroare la conectare. Încearcă din nou.');
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
        
        {/* Error message render */}
        {error && <div className="error-message">{error}</div>}
        
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email" 
            placeholder="Introdu adresa de email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Parolă</label>
          <div className="password-container">
            <input 
              id="password"
              type={showPassword ? 'text' : 'password'} 
              placeholder="Introdu parola"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? 'Ascunde' : 'Arată'}
            </button>
          </div>
        </div>

        <div className="input-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)} 
              disabled={isLoading}
            />
            Ține-mă minte
          </label>
        </div>

        <div className="forgot-password">
          {/* TODO: Add React Router Link */}
          <a href="/forgot-password">Ai uitat parola?</a>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Se încarcă...' : 'Intră în cont'}
        </button>

        <div className="register-link">
          {/* TODO: Add React Router Link */}
          Nu ai cont? <a href="/register">Înregistrează-te</a>
        </div>

      </form>
    </div>
  );
}

export default Login;