import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AdminDashboard() {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [inspectingRestaurant, setInspectingRestaurant] = useState(null);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'yes';
    if (!adminStatus || !localStorage.getItem('token')) {
      navigate('/home');
      return;
    }

    const fetchPending = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/admin/pending-restaurants/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingRestaurants(data);
        } else {
          const data = await response.json();
          setError(data.error || 'Nu am putut încărca restaurantele în așteptare.');
        }
      } catch (err) {
        console.error(err);
        setError('Eroare de conexiune cu serverul.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPending();
  }, [navigate]);

  const [bannedRestaurants, setBannedRestaurants] = useState([]);
  const [bannedSearchName, setBannedSearchName] = useState('');
  const [bannedSearchAddress, setBannedSearchAddress] = useState('');
  const [isBannedLoading, setIsBannedLoading] = useState(false);

  const fetchBannedRestaurants = async (searchName = '', searchAddress = '') => {
    setIsBannedLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchName) queryParams.append('search_name', searchName);
      if (searchAddress) queryParams.append('search_address', searchAddress);
      
      const response = await fetch(`/api/admin/banned-restaurants/?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBannedRestaurants(data);
      }
    } catch (err) {
      console.error("Error fetching banned list:", err);
    } finally {
      setIsBannedLoading(false);
    }
  };

  useEffect(() => {
    if (inspectingRestaurant) {
      fetchBannedRestaurants();
      setBannedSearchName('');
      setBannedSearchAddress('');
    }
  }, [inspectingRestaurant]);

  const banRestaurant = async (restaurantId) => {
    setMessage('');
    setError('');
    try {
      const response = await fetch(`/api/admin/ban-restaurant/${restaurantId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Restaurantul a fost adăugat în lista neagră și șters.');
        setPendingRestaurants((prev) => prev.filter((rest) => rest.id !== restaurantId));
      } else {
        setError(data.error || 'Nu am putut adăuga restaurantul în lista neagră.');
      }
    } catch (err) {
      console.error(err);
      setError('Eroare de conexiune la adăugarea în lista neagră.');
    }
  };

  const approveRestaurant = async (restaurantId) => {
    setMessage('');
    try {
      const response = await fetch(`/api/admin/approve-restaurant/${restaurantId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Restaurant aprobat.');
        setPendingRestaurants((prev) => prev.filter((rest) => rest.id !== restaurantId));
      } else {
        setError(data.error || 'Nu am putut aproba restaurantul.');
      }
    } catch (err) {
      console.error(err);
      setError('Eroare de conexiune la aprobarea restaurantului.');
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>Aprobă sau blochează restaurantele înregistrate înainte ca ele să fie afișate clienților.</p>
      </div>

      {message && <div className="success-message" style={{ marginBottom: '20px', width: '100%' }}>{message}</div>}
      {error && <div className="error-message" style={{ marginBottom: '20px', width: '100%' }}>{error}</div>}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>Se încarcă restaurantele în așteptare...</div>
      ) : (
        <> 
          {pendingRestaurants.length === 0 ? (
            <div style={{ padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '15px', textAlign: 'center', width: '100%', maxWidth: '600px', margin: '20px auto' }}>
              <h3>Nu există restaurante noi în așteptare.</h3>
              <p>Atunci când un proprietar va trimite un restaurant, îl vei vedea aici pentru aprobare.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', width: '100%' }}>
              {pendingRestaurants.map((restaurant) => (
                <div key={restaurant.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '18px', padding: '24px', boxShadow: '0 8px 22px rgba(0,0,0,0.04)', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                    <div>
                      <h2 style={{ margin: '0 0 10px', color: '#1a1a1a' }}>{restaurant.nume}</h2>
                      <p style={{ margin: '0 0 8px', color: '#666' }}>📍 {restaurant.adresa}</p>
                      <p style={{ margin: '0 0 8px', color: '#555' }}><strong>Owner:</strong> {restaurant.owner__email || 'N/A'}</p>
                    </div>
                    <span style={{ padding: '8px 12px', borderRadius: '999px', backgroundColor: '#fff3cd', color: '#856404', fontWeight: '700', fontSize: '0.85rem' }}>PENDING</span>
                  </div>
                  <p style={{ margin: '18px 0', color: '#444', minHeight: '80px' }}>{restaurant.descriere || 'Fără descriere încă.'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#E2001A', fontSize: '1rem', fontWeight: '700' }}>⭐ {restaurant.rating || '0.0'}</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => setInspectingRestaurant(restaurant)} className="login-button" style={{ width: 'auto', padding: '8px 14px', backgroundColor: '#6c757d', margin: 0, fontSize: '0.9rem' }}>
                        Inspectează
                      </button>
                      <button onClick={() => approveRestaurant(restaurant.id)} className="login-button" style={{ width: 'auto', padding: '8px 14px', backgroundColor: '#2ecc71', margin: 0, fontSize: '0.9rem' }}>
                        Aprobă
                      </button>
                      <button onClick={() => banRestaurant(restaurant.id)} className="login-button" style={{ width: 'auto', padding: '8px 14px', backgroundColor: '#e74c3c', margin: 0, fontSize: '0.9rem' }}>
                        Banează
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {inspectingRestaurant && (
        <div
          onClick={() => setInspectingRestaurant(null)}
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
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              padding: '30px',
              width: '900px',
              maxWidth: '95%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <h2 style={{ margin: 0, color: '#1a1a1a' }}>Inspecție: {inspectingRestaurant.nume}</h2>
              <button onClick={() => setInspectingRestaurant(null)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#666', padding: 0, lineHeight: 1 }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '10px' }}>
              {/* Left Column: Details */}
              <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <h3 style={{ borderBottom: '2px solid #E2001A', paddingBottom: '5px', color: '#E2001A', margin: '0 0 10px 0' }}>Detalii Restaurant</h3>
                <div>
                  <strong>📍 Adresă:</strong> {inspectingRestaurant.adresa}
                </div>
                <div>
                  <strong>👤 Owner Email:</strong> {inspectingRestaurant.owner__email || 'N/A'}
                </div>
                {inspectingRestaurant.telefon_contact && (
                  <div>
                    <strong>📞 Telefon Contact:</strong> {inspectingRestaurant.telefon_contact}
                  </div>
                )}
                {inspectingRestaurant.email_contact && (
                  <div>
                    <strong>✉️ Email Contact:</strong> {inspectingRestaurant.email_contact}
                  </div>
                )}
                <div>
                  <strong>⭐ Rating:</strong> {inspectingRestaurant.rating || '0.0'}
                </div>
                <div>
                  <strong>📝 Descriere:</strong>
                  <p style={{ margin: '5px 0 0 0', fontStyle: 'italic', color: '#444' }}>
                    {inspectingRestaurant.descriere || 'Fără descriere.'}
                  </p>
                </div>

                {/* Harta Locației */}
                <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', height: '180px', border: '1px solid #ddd' }}>
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(inspectingRestaurant.adresa)}&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Right Column: Similarity Check with Banned List */}
              <div style={{ flex: 1.2, minWidth: '350px', borderLeft: '1px solid #eee', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '5px', color: '#333', margin: '0 0 10px 0' }}>🛡️ Verificare Liste Negre (Banned)</h3>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      setBannedSearchName(inspectingRestaurant.nume);
                      fetchBannedRestaurants(inspectingRestaurant.nume, bannedSearchAddress);
                    }}
                    className="login-button" 
                    style={{ backgroundColor: '#6c757d', padding: '8px 12px', fontSize: '0.85rem', margin: 0, width: 'auto' }}
                  >
                    🔍 Caută Nume Similar
                  </button>
                  <button 
                    onClick={() => {
                      setBannedSearchAddress(inspectingRestaurant.adresa);
                      fetchBannedRestaurants(bannedSearchName, inspectingRestaurant.adresa);
                    }}
                    className="login-button" 
                    style={{ backgroundColor: '#6c757d', padding: '8px 12px', fontSize: '0.85rem', margin: 0, width: 'auto' }}
                  >
                    📍 Caută Adresă Similară
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>Filtru Nume</label>
                    <input 
                      type="text" 
                      placeholder="Nume restaurant..." 
                      value={bannedSearchName} 
                      onChange={(e) => {
                        setBannedSearchName(e.target.value);
                        fetchBannedRestaurants(e.target.value, bannedSearchAddress);
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>Filtru Adresă</label>
                    <input 
                      type="text" 
                      placeholder="Adresă..." 
                      value={bannedSearchAddress} 
                      onChange={(e) => {
                        setBannedSearchAddress(e.target.value);
                        fetchBannedRestaurants(bannedSearchName, e.target.value);
                      }}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {(bannedSearchName.trim() || bannedSearchAddress.trim()) && (
                  <div>
                    {bannedRestaurants.length > 0 ? (
                      <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>
                        ⚠️ Alertă: S-au găsit {bannedRestaurants.length} similitudini în lista neagră!
                      </span>
                    ) : (
                      <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>
                        ✅ Nicio potrivire găsită cu restaurante banate.
                      </span>
                    )}
                  </div>
                )}

                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: '#fafafa' }}>
                  {isBannedLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#666' }}>Se verifică listele...</div>
                  ) : bannedRestaurants.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '25px 0', color: '#777', fontSize: '0.9rem' }}>Niciun restaurant banat similar.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {bannedRestaurants.map((banned) => (
                        <div key={banned.id} style={{ padding: '8px 12px', backgroundColor: '#fff', border: '1px solid #f5c6cb', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 'bold', color: '#721c24', fontSize: '0.95rem' }}>🚫 {banned.nume}</span>
                          <span style={{ color: '#555', fontSize: '0.85rem' }}>📍 {banned.adresa}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button 
                onClick={() => setInspectingRestaurant(null)} 
                className="login-button" 
                style={{ backgroundColor: '#6c757d', width: 'auto', padding: '12px 20px', margin: 0 }}
              >
                Închide
              </button>
              <button 
                onClick={() => {
                  banRestaurant(inspectingRestaurant.id);
                  setInspectingRestaurant(null);
                }} 
                className="login-button" 
                style={{ backgroundColor: '#e74c3c', width: 'auto', padding: '12px 20px', margin: 0 }}
              >
                Banează restaurant
              </button>
              <button 
                onClick={() => {
                  approveRestaurant(inspectingRestaurant.id);
                  setInspectingRestaurant(null);
                }} 
                className="login-button" 
                style={{ backgroundColor: '#2ecc71', width: 'auto', padding: '12px 20px', margin: 0 }}
              >
                Aprobă restaurant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
