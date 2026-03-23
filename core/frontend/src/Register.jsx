import { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css'; 

function Register() {
  // Unified form state
  const [formData, setFormData] = useState({
    nume: '',
    prenume: '',
    email: '',
    telefon: '',
    gastronomie: '',
    mancare: '',
    bautura: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle dynamic input updates based on field name
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
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
      // TODO: Replace with backend register endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log("Register payload:", formData);
      
      // TODO: Redirect to /login on success
    } catch (err) {
      setError('Eroare la crearea contului. Încearcă din nou.');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '500px', margin: '40px 0' }}>
      <h1>Match & Dine</h1>
      <h2>Creează-ți profilul</h2>

      <form onSubmit={handleRegister}>
        
        {/* Error message render */}
        {error && <div className="error-message">{error}</div>}

        {/* --- Date Personale --- */}
        <div style={{ textAlign: 'left', marginBottom: '15px', color: '#E2001A', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>
          Date Personale
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="nume">Nume *</label>
            <input 
              id="nume" name="nume" type="text" placeholder="Ex: Popescu"
              value={formData.nume} onChange={handleChange} disabled={isLoading}
            />
          </div>

          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="prenume">Prenume *</label>
            <input 
              id="prenume" name="prenume" type="text" placeholder="Ex: Ion"
              value={formData.prenume} onChange={handleChange} disabled={isLoading}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="email">Email *</label>
          <input 
            id="email" name="email" type="email" placeholder="Introdu adresa de email"
            value={formData.email} onChange={handleChange} disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="telefon">Număr de telefon</label>
          <input 
            id="telefon" name="telefon" type="tel" placeholder="07xx xxx xxx"
            value={formData.telefon} onChange={handleChange} disabled={isLoading}
          />
        </div>

        {/* --- Preferințe Culinare --- */}
        <div style={{ textAlign: 'left', margin: '25px 0 15px 0', color: '#E2001A', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>
          Preferințe Culinare
        </div>

        <div className="input-group">
          <label htmlFor="gastronomie">Gastronomie preferată</label>
          <input 
            id="gastronomie" name="gastronomie" type="text" placeholder="Ex: Italiană, Japoneză, Tradițională"
            value={formData.gastronomie} onChange={handleChange} disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="mancare">Fel de mâncare</label>
            <input 
              id="mancare" name="mancare" type="text" placeholder="Ex: Paste Carbonara"
              value={formData.mancare} onChange={handleChange} disabled={isLoading}
            />
          </div>

          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="bautura">Băutură preferată</label>
            <input 
              id="bautura" name="bautura" type="text" placeholder="Ex: Vin Roșu, Limonadă"
              value={formData.bautura} onChange={handleChange} disabled={isLoading}
            />
          </div>
        </div>

        {/* --- Securitate --- */}
        <div style={{ textAlign: 'left', margin: '25px 0 15px 0', color: '#E2001A', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>
          Securitate
        </div>

        <div className="input-group">
          <label htmlFor="password">Parolă * (Min. 6 caractere)</label>
          <input 
            id="password" name="password" type="password" placeholder="Crează o parolă"
            value={formData.password} onChange={handleChange} disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirmă parola *</label>
          <input 
            id="confirmPassword" name="confirmPassword" type="password" placeholder="Repetă parola"
            value={formData.confirmPassword} onChange={handleChange} disabled={isLoading}
          />
        </div>

        <button type="submit" className="login-button" disabled={isLoading} style={{ marginTop: '20px' }}>
          {isLoading ? 'Se procesează...' : 'Finalizează Înregistrarea'}
        </button>

        <div className="register-link">
          {/* React Router Link instead of <a> */}
          Ai deja cont? <Link to="/login">Intră în cont</Link>
        </div>

      </form>
    </div>
  );
}

export default Register;