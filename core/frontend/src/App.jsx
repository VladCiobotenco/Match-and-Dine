import { useState } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (email.trim() === '' || password.trim() === '') {
      setError('Te rog să completezi ambele câmpuri!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      console.log("Date trimise la backend:", { email, password, rememberMe });
      setIsLoading(false); 
    }, 2000);
  };

  return (
    <div className="login-container">
      <h1>Match & Dine</h1>
      <h2>Autentificare</h2>

      <form onSubmit={handleLogin}>
        
        {error !== '' && (
          <div style={{ color: '#ff5252', marginBottom: '15px', fontWeight: 'bold' }}>
            {error}
          </div>
        )}
        
        <div className="input-group">
          <label>Email:</label>
          <input 
            type="email" 
            placeholder="Introdu adresa de email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <label>Parolă:</label>
          <div className="password-container">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Introdu parola"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
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
          <a href="#">Ai uitat parola?</a>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Se încarcă...' : 'Intră în cont'}
        </button>

        <div className="register-link">
          Nu ai cont? <a href="#">Înregistrează-te</a>
        </div>

      </form>
    </div>
  );
}

export default App;