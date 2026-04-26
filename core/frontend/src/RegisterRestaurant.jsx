import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function RegisterRestaurant() {
  const navigate = useNavigate();
  
  // Form state - FĂRĂ RATING
  const [formData, setFormData] = useState({
    numeRestaurant: '',
    cui: '',
    adresa: '',
    specific: '',
    telefonContact: '',
    descriere: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register-restaurant/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Trimitem datele curățate
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Restaurant created:", data);
        localStorage.setItem('isOwner', 'true');
        navigate('/dashboard'); 
      } else {
        setError(data.error || 'A apărut o eroare la înregistrare.');
      }
    } catch (err) {
      setError('Eroare de conexiune cu serverul. Încearcă din nou.');
      console.error('Restaurant registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '500px', margin: '40px 0' }}>
      <h1>Match & Dine Business</h1>
      <h2>Înregistrează-ți restaurantul</h2>

      <form onSubmit={handleRegister}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="input-group">
          <label htmlFor="numeRestaurant">Numele Restaurantului *</label>
          <input id="numeRestaurant" name="numeRestaurant" type="text" placeholder="Ex: Trattoria del Nonno" value={formData.numeRestaurant} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label htmlFor="cui">CUI (Cod Unic de Înregistrare) *</label>
          <input id="cui" name="cui" type="text" placeholder="Ex: RO12345678" value={formData.cui} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label htmlFor="adresa">Adresa completă *</label>
          <input id="adresa" name="adresa" type="text" placeholder="Strada, Număr, Oraș" value={formData.adresa} onChange={handleChange} required />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="specific">Specific Culinar</label>
            <input id="specific" name="specific" type="text" placeholder="Ex: Italian" value={formData.specific} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="telefonContact">Telefon Locație</label>
            <input id="telefonContact" name="telefonContact" type="tel" placeholder="07xx xxx xxx" value={formData.telefonContact} onChange={handleChange} />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="descriere">Descriere</label>
          <textarea id="descriere" name="descriere" placeholder="Câteva cuvinte despre restaurantul tău..." value={formData.descriere} onChange={handleChange} rows="3" />
        </div>

        {/* Câmpul Rating a fost complet eliminat de aici */}

        <button type="submit" className="login-button" disabled={isLoading} style={{ marginTop: '20px' }}>
          {isLoading ? 'Se configurează...' : 'Creează Dashboard-ul'}
        </button>
      </form>
    </div>
  );
}

export default RegisterRestaurant;