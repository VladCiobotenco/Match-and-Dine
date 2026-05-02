import { useState, useEffect } from 'react';
import './App.css';

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingMsg, setRatingMsg] = useState({});

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/user-reservations/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      } else {
        setError('Nu am putut încărca rezervările.');
      }
    } catch (err) {
      setError('Eroare de conexiune cu serverul.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleRate = async (resId, ratingValue) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rate-reservation/${resId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ nota: ratingValue })
      });
      
      if (response.ok) {
        setRatingMsg({ ...ratingMsg, [resId]: '✅ Nota a fost salvată!' });
        fetchReservations(); // Reîmprospătăm datele pentru a ascunde butoanele de rating
      } else {
        const data = await response.json();
        setRatingMsg({ ...ratingMsg, [resId]: data.error || 'Eroare la salvarea notei.' });
      }
    } catch (err) {
      setRatingMsg({ ...ratingMsg, [resId]: 'Eroare de conexiune.' });
    }
  };

  if (isLoading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Se încarcă rezervările tale...</div>;

  return (
    <div className="login-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '30px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>📅 Rezervările Mele</h1>
      {error && <div className="error-message">{error}</div>}
      
      {reservations.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
          <h3>Nu ai făcut nicio rezervare încă.</h3>
          <p style={{ color: '#666' }}>Găsește restaurantul perfect și rezervă o masă!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reservations.map(res => (
            <div key={res.id} style={{ padding: '20px', border: '1px solid #e5e5e5', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>{res.restaurant_nume}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem' }}>📅 Data: <strong>{res.data_timp}</strong></p>
                  <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>👥 Persoane: {res.persoane} | Status: <strong style={{ color: res.status === 'Așteptare' ? '#f39c12' : res.status === 'Confirmat' ? '#27ae60' : '#e74c3c' }}>{res.status}</strong></p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  {res.nota_acordata ? (
                    <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold' }}>
                      Nota acordată: ⭐ {res.nota_acordata}/5
                    </div>
                  ) : res.poate_da_rating ? (
                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', border: '1px dashed #ddd' }}>
                      <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '0.9rem' }}>Cum a fost experiența ta?</p>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            onClick={() => handleRate(res.id, star)}
                            style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #f5b041', borderRadius: '5px', fontSize: '1rem', transition: 'all 0.2s' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#fff3cd'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                          >
                            {star}
                          </button>
                        ))}
                      </div>
                      {ratingMsg[res.id] && <p style={{ color: '#27ae60', margin: '10px 0 0 0', fontSize: '0.85rem', fontWeight: 'bold' }}>{ratingMsg[res.id]}</p>}
                    </div>
                  ) : (
                     <div style={{ color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic', maxWidth: '150px' }}>
                       * Vei putea acorda o notă după ce a trecut data rezervării (și dacă este confirmată).
                     </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReservations;