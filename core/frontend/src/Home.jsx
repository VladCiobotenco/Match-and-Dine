import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function Home() {
  // UI & Data State
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch list on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Fetch specific details when selection changes
  useEffect(() => {
    if (selectedId) fetchDetails(selectedId);
  }, [selectedId]);

  // Handlers
  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/restaurants/');
      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetails = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${id}/`);
      const data = await response.json();
      setDetails(data);
    } catch (err) {
      console.error("Error fetching details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // View Components
  const ListView = () => (
    <div className="login-container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h1>🍽️ Restaurante Disponibile</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Descoperă locații noi și alege unde vrei să mănânci azi.</p>
      
      {restaurants.length === 0 ? (
        <p>Nu există restaurante înregistrate momentan.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {restaurants.map(res => (
            <div 
              key={res.id} 
              onClick={() => setSelectedId(res.id)}
              style={{ 
                backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '15px', 
                border: '1px solid #E5E5E5', cursor: 'pointer', textAlign: 'left',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{res.nume}</h3>
                <span style={{ color: '#E2001A', fontWeight: 'bold' }}>⭐ {res.rating}</span>
              </div>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: '5px 0' }}>📍 {res.adresa}</p>
              <p style={{ color: '#1A1A1A', marginTop: '10px' }}>{res.descriere?.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

const DetailView = () => (
    <div className="login-container" style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'left' }}>
      <button onClick={() => {setSelectedId(null); setDetails(null);}} style={{ background: 'none', border: 'none', color: '#E2001A', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
        ← Înapoi la listă
      </button>
      
      {details && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '25px', border: '1px solid #E5E5E5' }}>
          <h1 style={{ marginBottom: '10px' }}>{details.nume}</h1>
          <div style={{ color: '#E2001A', fontSize: '1.2rem', marginBottom: '20px' }}>Rating: {details.rating} / 5.0</div>
          
          <div style={{ marginBottom: '30px' }}>
            <h3>Despre noi</h3>
            <p style={{ lineHeight: '1.6', color: '#333' }}>{details.descriere || "Acest restaurant nu are încă o descriere."}</p>
          </div>

          <div style={{ backgroundColor: '#F9F6F0', padding: '20px', borderRadius: '15px' }}>
            <h4>Informații Contact</h4>
            <p style={{ margin: '5px 0' }}>📍 <strong>Adresă:</strong> {details.adresa}</p>
            <p style={{ margin: '5px 0' }}>📞 <strong>Telefon:</strong> {details.telefon || "Nespecificat"}</p>
            <p style={{ margin: '5px 0' }}>✉️ <strong>Email:</strong> {details.email}</p>
          </div>

          {/* --- BLOCUL NOU PENTRU MENIU --- */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px', borderBottom: '2px solid #E2001A', paddingBottom: '10px', display: 'inline-block' }}>🍽️ Meniu</h3>
            
            {details.meniu && details.meniu.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {details.meniu.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#FAFAFA', borderRadius: '10px', border: '1px solid #E5E5E5' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#1A1A1A' }}>{item.nume}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#666', backgroundColor: '#EAEAEA', padding: '3px 8px', borderRadius: '10px' }}>{item.categorie}</span>
                    </div>
                    <strong style={{ fontSize: '1.1rem', color: '#E2001A' }}>{item.pret} RON</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Acest restaurant nu și-a adăugat încă preparatele.</p>
            )}
          </div>
          {/* --- FINAL BLOC MENIU --- */}

        </div>
      )}
    </div>
  );

  if (isLoading && !restaurants.length) return <div style={{ padding: '50px' }}>Se încarcă restaurantele...</div>;

  return (
    <div className="home-layout">
      {selectedId ? <DetailView /> : <ListView />}
    </div>
  );
}

export default Home;