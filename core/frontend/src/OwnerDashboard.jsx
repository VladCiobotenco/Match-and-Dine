import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function OwnerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/owner-restaurants/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRestaurants(data);
        } else {
          setError('Nu am putut încărca lista de restaurante.');
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError('Eroare de conexiune cu serverul.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Se încarcă restaurantele tale...</div>;
  }

  return (
    <div className="login-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '30px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Restaurantele Mele</h1>
        <Link to="/register-restaurant" style={{ textDecoration: 'none' }}>
          <button className="login-button" style={{ width: 'auto', padding: '10px 20px', margin: 0 }}>
            + Adaugă Restaurant
          </button>
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {restaurants.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
          <h3>Nu ai niciun restaurant înregistrat încă.</h3>
          <p style={{ color: '#666' }}>Adaugă primul tău restaurant pentru a începe să primești rezervări!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {restaurants.map((rest) => (
            <div key={rest.id} onClick={() => navigate(`/dashboard/${rest.id}`)} style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '15px', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>{rest.nume}</h3>
              <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>📍 {rest.adresa}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ color: '#E2001A', fontWeight: 'bold', fontSize: '0.9rem' }}>Gestionează &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;