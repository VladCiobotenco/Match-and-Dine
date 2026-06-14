import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './App.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isOwner, isAdmin, logout } = useAuth();
  

  // Nu afișăm meniul pe paginile de login/register
  const hiddenRoutes = ['/login', '/register', '/register-success', '/register-restaurant'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <nav className="global-navbar" style={{ minHeight: '80px', display: 'flex', alignItems: 'center' }}>
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/favicon.png" alt="Match & Dine logo" style={{ height: '60px' }} />
        <span>Match & Dine</span>
      </div>
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
        
        <Link to="/about" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname === '/despre-noi' ? '#E2001A' : 'white', color: location.pathname === '/despre-noi' ? 'white' : '#E2001A', fontWeight: 'bold' }}>
            Despre Noi
          </button>
        </Link>
        
        {isLoggedIn && (
          <Link to="/my-reservations" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname === '/my-reservations' ? '#E2001A' : 'white', color: location.pathname === '/my-reservations' ? 'white' : '#E2001A', fontWeight: 'bold' }}>
              📅 Rezervările Mele
            </button>
          </Link>
        )}
        
        {isLoggedIn && (
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname === '/profile' ? '#E2001A' : 'white', color: location.pathname === '/profile' ? 'white' : '#E2001A', fontWeight: 'bold' }}>
              👤 Profil
            </button>
          </Link>
        )}

        {/* Butonul de Dashboard apare DOAR dacă userul este owner */}
        {isOwner && (
          <Link to="/owner-dashboard" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname.includes('/owner-dashboard') ? '#E2001A' : 'white', color: location.pathname.includes('/owner-dashboard') ? 'white' : '#E2001A', fontWeight: 'bold' }}>
              Restaurantele Mele
            </button>
          </Link>
        )}

        {/* Butonul de Admin Dashboard apare DOAR dacă userul este admin */}
        {isLoggedIn && isAdmin === 'yes' && (
          <Link to="/admin-dashboard" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #E2001A', backgroundColor: location.pathname === '/admin-dashboard' ? '#E2001A' : 'white', color: location.pathname === '/admin-dashboard' ? 'white' : '#E2001A', fontWeight: 'bold' }}>
              Admin Dashboard
            </button>
          </Link>
        )}
        
        {isLoggedIn ? (
          <button onClick={() => { logout(); navigate('/home'); }} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#6c757d', color: 'white', fontWeight: 'bold' }}>
            Deconectare
          </button>
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