import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css'; 

function Register() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    nume: '',
    prenume: '',
    email: '',
    telefon: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.nume.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Te rog să completezi câmpurile obligatorii!');
      return;
    }
    if (formData.password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere!');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Parolele nu coincid!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nume: formData.nume,
          prenume: formData.prenume,
          email: formData.email,
          telefon: formData.telefon,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Logăm utilizatorul automat salvând token-ul primit
        localStorage.setItem('token', data.token);
        localStorage.setItem('isOwner', data.isOwner);
        localStorage.setItem('userEmail', data.email);
        navigate('/register-success');
      } else {
        setError(data.error || 'Eroare la crearea contului. Încearcă din nou.');
      }
    } catch (err) {
      setError('Eroare la crearea contului. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '500px', margin: '40px 0' }}>
      <h1>Match & Dine</h1>
      <h2>Creează-ți profilul</h2>

      <form onSubmit={handleRegister}>
        {error && <div className="error-message">{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="nume">Nume *</label>
            <input id="nume" name="nume" type="text" placeholder="Ex: Popescu" value={formData.nume} onChange={handleChange} disabled={isLoading}/>
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="prenume">Prenume *</label>
            <input id="prenume" name="prenume" type="text" placeholder="Ex: Ion" value={formData.prenume} onChange={handleChange} disabled={isLoading}/>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" placeholder="Introdu adresa de email" value={formData.email} onChange={handleChange} disabled={isLoading}/>
        </div>

        <div className="input-group">
          <label htmlFor="telefon">Număr de telefon</label>
          <input id="telefon" name="telefon" type="tel" placeholder="07xx xxx xxx" value={formData.telefon} onChange={handleChange} disabled={isLoading}/>
        </div>

        <div className="input-group" style={{ marginTop: '25px' }}>
          <label htmlFor="password">Parolă * (Min. 6 caractere)</label>
          <input id="password" name="password" type="password" placeholder="Crează o parolă" value={formData.password} onChange={handleChange} disabled={isLoading}/>
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirmă parola *</label>
          <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repetă parola" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading}/>
        </div>

        <button type="submit" className="login-button" disabled={isLoading} style={{ marginTop: '20px' }}>
          {isLoading ? 'Se procesează...' : 'Continuă'}
        </button>

        <div className="register-link">
          Ai deja cont? <Link to="/login">Intră în cont</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;