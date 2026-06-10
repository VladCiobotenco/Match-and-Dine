import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './App.css';

function UserProfile() {
  const { isOwner } = useAuth();
  
  const [profileData, setProfileData] = useState({
    email: '',
    telefon: '',
    gastronomie_preferata: '',
    fel_de_mancare_preferat: '',
    bautura_preferata: '',
    date_joined: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          setError('Nu am putut încărca datele de profil.');
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError('Eroare de conexiune cu serverul.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      if (response.ok) {
        toast.success('Profilul a fost salvat cu succes! 🎉');
      } else {
        toast.error('Nu s-a putut salva profilul.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Eroare de conexiune la salvare.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        Se încarcă profilul...
      </div>
    );
  }

  return (
    <div className="login-container" style={{ margin: '40px auto', padding: '30px', maxWidth: '900px', width: '95%', textAlign: 'center' }}>
      <form onSubmit={handleSave} style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', textAlign: 'left' }}>
        
        {/* Left Side: Avatar and Account Info */}
        <div style={{ 
          flex: '1 1 250px', 
          backgroundColor: '#f9f9f9', 
          padding: '25px', 
          borderRadius: '15px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center',
          border: '1px solid #eef0f2',
          boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
        }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '15px' }}>👤</div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', color: '#1a1a1a' }}>Profilul Meu</h2>
          <span style={{ 
            display: 'inline-block',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            backgroundColor: isOwner ? '#fff3cd' : '#d1ecf1',
            color: isOwner ? '#856404' : '#0c5460',
            marginTop: '5px',
            marginBottom: '20px'
          }}>
            {isOwner ? '👑 Partener / Owner' : '🍽️ Client (Foodie)'}
          </span>
          <div style={{ fontSize: '0.85rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '15px', width: '100%' }}>
            <strong>Membru din:</strong>
            <div style={{ marginTop: '5px', color: '#333', fontWeight: 'bold' }}>{profileData.date_joined || 'N/A'}</div>
          </div>
        </div>

        {/* Right Side: Grid of Editable Fields */}
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ color: '#555', fontWeight: 'bold', fontSize: '0.85rem' }}>Email Cont:</label>
              <input 
                type="email" 
                value={profileData.email} 
                disabled 
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#e9ecef', color: '#495057', cursor: 'not-allowed' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ color: '#555', fontWeight: 'bold', fontSize: '0.85rem' }}>Telefon:</label>
              <input 
                type="tel" 
                value={profileData.telefon} 
                onChange={(e) => setProfileData({...profileData, telefon: e.target.value})}
                placeholder="Introdu numărul de telefon"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ color: '#555', fontWeight: 'bold', fontSize: '0.85rem' }}>Gastronomie Preferată:</label>
              <input 
                type="text" 
                value={profileData.gastronomie_preferata} 
                onChange={(e) => setProfileData({...profileData, gastronomie_preferata: e.target.value})}
                placeholder="Ex: Italiană, Asiatică"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ color: '#555', fontWeight: 'bold', fontSize: '0.85rem' }}>Mâncarea Preferată:</label>
              <input 
                type="text" 
                value={profileData.fel_de_mancare_preferat} 
                onChange={(e) => setProfileData({...profileData, fel_de_mancare_preferat: e.target.value})}
                placeholder="Ex: Pizza Diavola, Sushi"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label style={{ color: '#555', fontWeight: 'bold', fontSize: '0.85rem' }}>Băutura Preferată:</label>
              <input 
                type="text" 
                value={profileData.bautura_preferata} 
                onChange={(e) => setProfileData({...profileData, bautura_preferata: e.target.value})}
                placeholder="Ex: Vin Roșu, Limonadă"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' }}
              />
            </div>

          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={isSaving} 
            style={{ marginTop: '5px', width: '100%', padding: '12px' }}
          >
            {isSaving ? 'Se salvează...' : '💾 Salvează Profil'}
          </button>

          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <Link to="/my-reservations" style={{ textDecoration: 'none', flex: 1 }}>
              <button type="button" className="login-button" style={{ backgroundColor: '#1a1a1a', width: '100%', margin: 0, padding: '10px', fontSize: '0.9rem' }}>
                📅 Rezervări
              </button>
            </Link>
            <Link to="/forgot-password" style={{ textDecoration: 'none', flex: 1 }}>
              <button type="button" className="login-button" style={{ backgroundColor: '#6c757d', width: '100%', margin: 0, padding: '10px', fontSize: '0.9rem' }}>
                🔒 Schimbă Parola
              </button>
            </Link>
          </div>

        </div>
      </form>
    </div>
  );
}

export default UserProfile;