import { Link } from 'react-router-dom';
import './App.css'; 

function RegisterSuccess() {
  return (
    <div className="login-container" style={{ textAlign: 'center', padding: '60px 40px' }}>
      {/* Icon */}
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
      
      <h1 style={{ marginBottom: '10px' }}>Gata, te-ai înregistrat!</h1>
      <p style={{ color: '#666666', marginBottom: '40px', lineHeight: '1.5' }}>
        Contul tău a fost creat cu succes. Acum ești gata să descoperi cele mai bune restaurante din zonă.
      </p>

      {/* Primary Action */}
      <Link to="/home" style={{ textDecoration: 'none' }}>
        <button className="login-button" style={{ marginBottom: '30px' }}>
          Intră în aplicație (Main Page)
        </button>
      </Link>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#E5E5E5', marginBottom: '30px' }}></div>

      {/* Secondary Action / Upsell */}
      <h3 style={{ fontSize: '1rem', color: '#1A1A1A', marginBottom: '10px' }}>Ai un restaurant?</h3>
      <div className="register-link">
        Transformă-ți contul în Restaurant Owner și <Link to="/register-restaurant" style={{ color: '#E2001A', fontWeight: 'bold' }}>adaugă restaurantul tău</Link>.
      </div>
    </div>
  );
}

export default RegisterSuccess;