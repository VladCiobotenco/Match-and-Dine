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
    <nav className="global-navbar">
      <div className="navbar-brand">🍽️ Match & Dine</div>
      <div className="navbar-links">
        <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>Acasă (Restaurante)</Link>
        
        {/* Butonul de Dashboard apare DOAR dacă userul este owner */}
        {isOwner && (
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            Dashboard Restaurant
          </Link>
        )}
        
        <Link to="/login" onClick={() => localStorage.clear()} className="logout-btn">Deconectare</Link>
      </div>
    </nav>
  );
}

export default Navbar;