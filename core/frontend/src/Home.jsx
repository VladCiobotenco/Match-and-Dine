import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants/');
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

  return (
    <div className="login-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '30px', textAlign: 'center' }}>
      <h1>Match & Dine</h1>
      <p>Descoperă cele mai bune restaurante!</p>
      
      {localStorage.getItem('isOwner') === 'true' && (
        <Link to="/owner-dashboard" className="login-button" style={{ display: 'inline-block', width: 'auto', textDecoration: 'none', margin: '20px 0' }}>Restaurantele mele</Link>
      )}

      <div style={{ marginTop: '40px', textAlign: 'left' }}>
        <h2 style={{ marginBottom: '20px' }}>Restaurante Disponibile</h2>
        
        {isLoading && <p>Se încarcă restaurantele...</p>}
        {error && <div className="error-message">{error}</div>}
        
        {!isLoading && !error && restaurants.length === 0 && (
          <p>Nu există restaurante înregistrate momentan.</p>
        )}

        {!isLoading && !error && restaurants.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {restaurants.map((rest) => (
              <div key={rest.id} onClick={() => setSelectedRestaurant(rest)} style={{ cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '15px', padding: '20px', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>{rest.nume}</h3>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>📍 {rest.adresa}</p>
                {rest.descriere && (
                  <p style={{ margin: '0 0 15px 0', color: '#444', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    {rest.descriere.length > 100 ? `${rest.descriere.substring(0, 100)}...` : rest.descriere}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#f5b041', fontWeight: 'bold' }}>⭐ {rest.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedRestaurant && (
          <div
            className="modal-backdrop-anim"
            onClick={() => setSelectedRestaurant(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
          >
            <div
              className="modal-content-anim"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                padding: '30px',
                width: '70vw',
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#1a1a1a' }}>{selectedRestaurant.nume}</h2>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '1.1rem' }}>📍 {selectedRestaurant.adresa}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <span style={{ color: '#f5b041', fontWeight: 'bold', fontSize: '1.2rem' }}>⭐ {selectedRestaurant.rating}</span>
                  </div>
                  {selectedRestaurant.descriere && (
                    <p style={{ margin: '0', color: '#444', fontSize: '1rem', fontStyle: 'italic' }}>
                      {selectedRestaurant.descriere}
                    </p>
                  )}
                </div>
                <button onClick={() => setSelectedRestaurant(null)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#666', padding: 0, lineHeight: 1 }}>&times;</button>
              </div>
              <div style={{ flex: 1, borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                <iframe
                  title={`Harta pentru ${selectedRestaurant.nume}`}
                  width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                  src={`https://www.google.com/maps?q=${encodeURIComponent(selectedRestaurant.adresa)}&output=embed`}
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
