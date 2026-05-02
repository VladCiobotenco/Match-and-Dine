import { Link, useLocation } from 'react-router-dom';
import './App.css';

function Navbar() {
  const location = useLocation();
  
  // Citim din memoria browserului
  const isOwner = localStorage.getItem('isOwner') === 'true';
  const isLoggedIn = !!localStorage.getItem('token');

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
        
        <Link to="/food-tinder" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname === '/food-tinder' ? '#E2001A' : 'white', color: location.pathname === '/food-tinder' ? 'white' : '#E2001A', fontWeight: 'bold' }}>
            🔥 Food Match
          </button>
        </Link>
        
        {isLoggedIn && (
          <Link to="/my-reservations" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname === '/my-reservations' ? '#E2001A' : 'white', color: location.pathname === '/my-reservations' ? 'white' : '#E2001A', fontWeight: 'bold' }}>
              📅 Rezervările Mele
            </button>
          </Link>
        )}

        {/* Butonul de Dashboard apare DOAR dacă userul este owner */}
        {isOwner && (
          <Link to="/owner-dashboard" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname.includes('/dashboard') ? '#E2001A' : 'white', color: location.pathname.includes('/dashboard') ? 'white' : '#E2001A', fontWeight: 'bold' }}>
              Restaurantele Mele
            </button>
          </Link>
        )}
        
        {isLoggedIn ? (
          <Link to="/login" onClick={() => localStorage.clear()} style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#6c757d', color: 'white', fontWeight: 'bold' }}>
              Deconectare
            </button>
          </Link>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#E2001A', color: 'white', fontWeight: 'bold' }}>
              Autentificare
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;