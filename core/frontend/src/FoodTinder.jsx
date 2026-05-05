import { useState, useEffect } from 'react';
import './App.css';

function FoodTinder() {
  const [prompt, setPrompt] = useState('');
  const [deck, setDeck] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [likedMatches, setLikedMatches] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' sau 'right'

  // State-uri pentru rezervare
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('');
  const [resPersons, setResPersons] = useState(2);
  const [bookingMsg, setBookingMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/swipe-deck/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeck(data);
        setHasSearched(true);
      } else {
        setError('A apărut o eroare la generarea recomandărilor.');
      }
    } catch (err) {
      setError('Eroare de conexiune cu serverul.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (restaurantId, action, matchScore) => {
    // Declanșăm animația vizuală
    setSwipeDirection(action === 'LIKE' ? 'right' : 'left');

    // Așteptăm să se termine animația CSS (500ms) înainte să schimbăm cardul
    setTimeout(async () => {
      // Eliminăm restaurantul curent din pachet
      setDeck((prevDeck) => prevDeck.filter(r => r.id !== restaurantId));
      setSwipeDirection(null); // Resetăm starea de swipe pentru următorul card

      // Înregistrăm acțiunea în backend
      try {
        await fetch('http://127.0.0.1:8000/api/record-swipe/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ restaurant_id: restaurantId, action, match_score: matchScore }),
        });
      } catch (err) {
        console.error("Eroare la salvarea preferinței:", err);
      }
    }, 500); 
  };

  useEffect(() => {
    // Când lista se termină dar userul a căutat ceva, preluăm tot topul generat
    if (hasSearched && deck.length === 0) {
      const fetchMatches = async () => {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/my-matches/', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (response.ok) {
            const data = await response.json();
            setLikedMatches(data);
          }
        } catch(err) {
          console.error(err);
        }
      };
      fetchMatches();
    }
  }, [deck.length, hasSearched]);

  const handleReserveClick = async (restId) => {
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

  const currentCard = deck[0]; // Arătăm mereu prima carte din pachet

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#E2001A', marginBottom: '10px' }}>Food Matchmaker</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Spune-i AI-ului ce pofte ai, iar el îți va găsi locul perfect!</p>

      {!hasSearched ? (
        <form onSubmit={handleSearch} className="login-container" style={{ margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div className="input-group">
            <textarea 
              placeholder="Ex: Am poftă de niște paste carbonara autentice sau o pizza bună..." 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              rows="4"
              style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading || !prompt.trim()}>
            {isLoading ? <span className="loading-dots">AI-ul analizează dorințele tale</span> : 'Găsește-mi mâncare'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      ) : (
        <div className="tinder-card-container">
          {currentCard ? (
            <div key={currentCard.id} className={`tinder-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}>
              <div style={{ backgroundColor: '#E2001A', color: 'white', display: 'inline-block', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
                {currentCard.matchScore}% AI Match
              </div>
              <h2 style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>{currentCard.nume}</h2>
              <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '20px' }}>📍 {currentCard.adresa}</p>
              <p style={{ color: '#333', fontStyle: 'italic', marginBottom: '40px', minHeight: '80px', lineHeight: '1.5' }}>
                "{currentCard.descriere || 'Acest restaurant te așteaptă cu preparate delicioase.'}"
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
                <button className="swipe-btn" onClick={() => handleSwipe(currentCard.id, 'REJECT', currentCard.matchScore)} style={{ color: '#ff4b4b' }} disabled={swipeDirection !== null}>
                  ❌
                </button>
                <button className="swipe-btn" onClick={() => handleSwipe(currentCard.id, 'LIKE', currentCard.matchScore)} style={{ color: '#4CAF50' }} disabled={swipeDirection !== null}>
                  ❤️
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '50px', backgroundColor: '#f9f9f9', borderRadius: '20px' }}>
              <h3>Acesta a fost tot pachetul de recomandări!</h3>
              
              {likedMatches.length > 0 ? (
                <div style={{ marginTop: '30px', textAlign: 'left' }}>
                  <h4 style={{ color: '#E2001A', marginBottom: '15px' }}>🏆 Topul tău curent:</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {likedMatches.map(match => (
                      <li key={match.id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '10px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem' }}>{match.nume}</strong>
                          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>📍 {match.adresa}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ backgroundColor: '#4CAF50', color: 'white', padding: '5px 10px', borderRadius: '10px', fontWeight: 'bold' }}>
                            {match.matchScore}%
                          </div>
                          <button onClick={() => handleReserveClick(match.id)} style={{ padding: '8px 15px', backgroundColor: '#E2001A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Rezervă
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ marginTop: '20px' }}>Nu ai dat niciun Like încă.</p>
              )}
              
              <button onClick={() => { setHasSearched(false); setPrompt(''); setLikedMatches([]); }} className="login-button" style={{ marginTop: '20px' }}>
                Caută altceva
              </button>
            </div>
          )}
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
              overflow: 'hidden',
              textAlign: 'left'
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
                  <div style={{ textAlign: 'left' }}><label>Data</label><input type="date" required value={resDate} onChange={e => setResDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} /></div>
                  <div style={{ textAlign: 'left' }}><label>Ora</label><input type="time" required value={resTime} onChange={e => setResTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} /></div>
                  <div style={{ textAlign: 'left' }}><label>Persoane</label><input type="number" min="1" max="20" required value={resPersons} onChange={e => setResPersons(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} /></div>
                  
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
  );
}

export default FoodTinder;