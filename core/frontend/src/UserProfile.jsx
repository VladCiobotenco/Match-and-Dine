import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import './App.css';

function UserProfile() {
  const { isOwner } = useAuth();
  const userEmail = localStorage.getItem('userEmail') || 'Utilizator Autentificat';

  return (
    <div className="login-container" style={{ margin: '40px auto', padding: '40px', maxWidth: '500px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px', textAlign: 'center' }}>👤</div>
      <h1 style={{ textAlign: 'center' }}>Profilul Meu</h1>
      
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '15px', marginTop: '30px', textAlign: 'left' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>Email Cont:</label>
          <div style={{ fontSize: '1.1rem', color: '#1a1a1a', marginTop: '5px' }}>{userEmail}</div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>Tip Cont:</label>
          <div style={{ fontSize: '1.1rem', color: '#1a1a1a', marginTop: '5px' }}>
            {isOwner ? '👑 Partener / Proprietar Restaurant' : '🍽️ Client (Foodie)'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Link to="/my-reservations" style={{ textDecoration: 'none' }}>
          <button className="login-button" style={{ backgroundColor: '#1a1a1a', width: '100%' }}>📅 Vezi Rezervările Mele</button>
        </Link>
        <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
          <button className="login-button" style={{ backgroundColor: '#6c757d', width: '100%' }}>🔒 Schimbă Parola</button>
        </Link>
      </div>
    </div>
  );
}

export default UserProfile;