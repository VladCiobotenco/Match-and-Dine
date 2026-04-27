import { Link, useLocation } from 'react-router-dom';
import './App.css';

function Navbar() {
  const location = useLocation();
  
  // Citim din memoria browserului
  const isOwner = localStorage.getItem('isOwner') === 'true';

  // Nu afișăm meniul pe paginile de login/register
  const hiddenRoutes = ['/login', '/register', '/register-success', '/register-restaurant'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <nav className="global-navbar" style={{ minHeight: '80px', display: 'flex', alignItems: 'center' }}>
      <div className="navbar-brand">🍽️ Match & Dine</div>
      <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname === '/home' ? '#E2001A' : 'white', color: location.pathname === '/home' ? 'white' : '#E2001A', fontWeight: 'bold' }}>
            Acasă
          </button>
        </Link>
        
        {/* Butonul de Dashboard apare DOAR dacă userul este owner */}
        {isOwner && (
          <Link to="/owner-dashboard" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname.includes('/dashboard') ? '#E2001A' : 'white', color: location.pathname.includes('/dashboard') ? 'white' : '#E2001A', fontWeight: 'bold' }}>
              Restaurantele Mele
            </button>
          </Link>
        )}
        
        <Link to="/login" onClick={() => localStorage.clear()} style={{ textDecoration: 'none' }}>
          <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#6c757d', color: 'white', fontWeight: 'bold' }}>
            Deconectare
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;