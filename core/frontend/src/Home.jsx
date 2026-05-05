import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  // State-uri pentru rezervare
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('');
  const [resPersons, setResPersons] = useState(2);
  const [bookingMsg, setBookingMsg] = useState('');

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

  const handleCardClick = async (restId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${restId}/`);
      if (response.ok) {
        const data = await response.json();
        setSelectedRestaurant(data);
        setBookingMsg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      setBookingMsg('Trebuie să fii conectat pentru a face o rezervare.');
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${selectedRestaurant.id}/reserve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: resDate, ora: resTime, persoane: resPersons })
      });
      const data = await response.json();
      if (response.ok) {
        setBookingMsg('✅ Rezervare trimisă cu succes!');
        setTimeout(() => setSelectedRestaurant(null), 2500); // închide fereastra automat
      } else {
        setBookingMsg(`❌ Eroare: ${data.error}`);
      }
    } catch (err) {
      setBookingMsg('Eroare de conexiune.');
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Match & Dine</h1>
        <p>Descoperă cele mai bune restaurante din zona ta!</p>
      
        {localStorage.getItem('isOwner') === 'true' && (
          <Link to="/owner-dashboard" className="login-button" style={{ display: 'inline-block', width: 'auto', textDecoration: 'none' }}>Restaurantele mele</Link>
        )}
      </div>

      <div>
        <h2 style={{ marginBottom: '20px' }}>Restaurante Disponibile</h2>
        
        {isLoading && <p>Se încarcă restaurantele...</p>}
        {error && <div className="error-message">{error}</div>}
        
        {!isLoading && !error && restaurants.length === 0 && (
          <p>Nu există restaurante înregistrate momentan.</p>
        )}

        {!isLoading && !error && restaurants.length > 0 && (
          <div className="restaurant-grid">
            {restaurants.map((rest) => (
              <div key={rest.id} onClick={() => handleCardClick(rest.id)} className="restaurant-card">
                <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontSize: '1.4rem' }}>{rest.nume}</h3>
                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.95rem' }}>📍 {rest.adresa}</p>
                {rest.descriere && (
                  <p style={{ margin: '0 0 20px 0', color: '#444', fontSize: '0.95rem', fontStyle: 'italic', flexGrow: 1 }}>
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
              
              <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                {/* Secțiunea de Meniu */}
                <div style={{ flex: 2, textAlign: 'left' }}>
                  <h3 style={{ borderBottom: '2px solid #E2001A', paddingBottom: '10px', color: '#E2001A' }}>Meniul Nostru</h3>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px', marginTop: '15px' }}>
                    {selectedRestaurant.meniu && selectedRestaurant.meniu.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {selectedRestaurant.meniu.map(item => (
                          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px dashed #ddd' }}>
                            <span style={{ fontWeight: '500' }}>{item.nume} <small style={{ color: '#888' }}>({item.categorie})</small></span>
                            <span style={{ fontWeight: 'bold', color: '#E2001A' }}>{item.pret} RON</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Acest restaurant nu are încă meniul adăugat.</p>
                    )}
                  </div>
                </div>

                {/* Secțiunea de Rezervare */}
                <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ marginBottom: '15px' }}>Rezervă o masă</h3>
                  <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ textAlign: 'left' }}><label>Data</label><input type="date" required value={resDate} onChange={e => setResDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                    <div style={{ textAlign: 'left' }}><label>Ora</label><input type="time" required value={resTime} onChange={e => setResTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                    <div style={{ textAlign: 'left' }}><label>Persoane</label><input type="number" min="1" max="20" required value={resPersons} onChange={e => setResPersons(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} /></div>
                    
                    <button type="submit" className="login-button" style={{ marginTop: '10px', padding: '12px' }}>
                      Confirmă Rezervarea
                    </button>
                    {bookingMsg && (
                      <p style={{ marginTop: '10px', fontWeight: 'bold', color: bookingMsg.includes('✅') ? 'green' : '#E2001A' }}>{bookingMsg}</p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
