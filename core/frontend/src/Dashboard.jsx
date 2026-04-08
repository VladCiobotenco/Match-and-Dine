import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function Dashboard() {
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data state
  const [restaurantData, setRestaurantData] = useState(null);
  
  // Mock data state (TODO: Remove after API integration)
  const [menuItems, setMenuItems] = useState([
    { id: 1, nume: 'Paste Carbonara', pret: 45, categorie: 'Fel principal' },
    { id: 2, nume: 'Tiramisu', pret: 25, categorie: 'Desert' }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState({ nume: '', pret: '', categorie: '' });

  const [reservations, setReservations] = useState([
    { id: 1, numeClient: 'Popescu Ion', data: 'Azi, 19:30', persoane: 2, status: 'Așteptare' },
    { id: 2, numeClient: 'Maria Ionescu', data: 'Azi, 20:00', persoane: 4, status: 'Confirmat' }
  ]);

  // Handlers
  const handleAddDish = (e) => {
    e.preventDefault();
    if (!newDish.nume || !newDish.pret) return;

    // TODO: Implement POST /api/menu
    const itemNou = { 
      id: Date.now(),
      nume: newDish.nume, 
      pret: Number(newDish.pret), 
      categorie: newDish.categorie || 'General'
    };
    
    setMenuItems([...menuItems, itemNou]);
    setNewDish({ nume: '', pret: '', categorie: '' });
    setShowAddForm(false);
  };

  const handleDeleteDish = (id) => {
    // TODO: Implement DELETE /api/menu/:id
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleUpdateReservation = (id, newStatus) => {
    // TODO: Implement PATCH /api/reservations/:id
    setReservations(reservations.map(res => 
      res.id === id ? { ...res, status: newStatus } : res
    ));
  };

  // Lifecycle
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual fetch
        await new Promise(resolve => setTimeout(resolve, 800));
        setRestaurantData({ 
          nume: "Restaurantul Meu", 
          views: 342, 
          matches: 85, 
          reservations: reservations.length 
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [reservations.length]); // Added dependency to update reservations count

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Vizualizări Profil</h3>
                <div className="value">{restaurantData?.views || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Match-uri</h3>
                <div className="value">{restaurantData?.matches || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Rezervări Noi</h3>
                <div className="value">{reservations.filter(r => r.status === 'Așteptare').length}</div>
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '30px' }}>
              <h2>Activitate Recentă</h2>
              <p style={{ color: '#666', marginTop: '10px' }}>Sistemul este activ. Așteptăm noi interacțiuni de la clienți!</p>
            </div>
          </>
        );

      case 'menu':
        return (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>🍽️ Gestionare Meniu</h2>
              <button onClick={() => setShowAddForm(!showAddForm)} className="login-button" style={{ width: 'auto', padding: '8px 16px', margin: 0 }}>
                {showAddForm ? 'Anulează' : '+ Adaugă Preparat'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddDish} style={{ backgroundColor: '#F9F6F0', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                  <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                    <label>Nume preparat *</label>
                    <input type="text" value={newDish.nume} onChange={e => setNewDish({...newDish, nume: e.target.value})} required placeholder="Ex: Pizza Margherita" />
                  </div>
                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Preț (RON) *</label>
                    <input type="number" value={newDish.pret} onChange={e => setNewDish({...newDish, pret: e.target.value})} required placeholder="45" />
                  </div>
                  <div className="input-group" style={{ flex: 1.5, marginBottom: 0 }}>
                    <label>Categorie</label>
                    <input type="text" value={newDish.categorie} onChange={e => setNewDish({...newDish, categorie: e.target.value})} placeholder="Ex: Fel principal" />
                  </div>
                  <button type="submit" className="login-button" style={{ width: 'auto', marginBottom: 0, padding: '16px 24px' }}>Salvează</button>
                </div>
              </form>
            )}

            <div>
              {menuItems.length === 0 ? <p>Meniul este gol. Adaugă un preparat!</p> : null}
              {menuItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #E5E5E5' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 5px 0' }}>{item.nume}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#666', backgroundColor: '#F0F0F0', padding: '2px 8px', borderRadius: '10px' }}>{item.categorie}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{item.pret} RON</strong>
                    <button onClick={() => handleDeleteDish(item.id)} style={{ background: 'none', border: 'none', color: '#E2001A', cursor: 'pointer', fontWeight: 'bold' }}>Șterge</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reservations':
        return (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '30px' }}>
            <h2>📅 Rezervările Mele</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Gestionează cererile primite de la clienți.</p>
            
            <div>
              {reservations.map((res) => (
                <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #E5E5E5', borderRadius: '15px', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 5px 0' }}>{res.numeClient} <span style={{ fontWeight: 'normal', color: '#666' }}>({res.persoane} persoane)</span></h4>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>🕒 {res.data}</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ 
                      fontWeight: 'bold', fontSize: '0.85rem', padding: '5px 10px', borderRadius: '20px',
                      backgroundColor: res.status === 'Așteptare' ? '#FFF3CD' : res.status === 'Confirmat' ? '#D4EDDA' : '#F8D7DA',
                      color: res.status === 'Așteptare' ? '#856404' : res.status === 'Confirmat' ? '#155724' : '#721C24'
                    }}>
                      {res.status}
                    </span>

                    {res.status === 'Așteptare' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleUpdateReservation(res.id, 'Confirmat')} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Acceptă</button>
                        <button onClick={() => handleUpdateReservation(res.id, 'Respins')} style={{ background: '#E2001A', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Respinge</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Se încarcă datele restaurantului...</div>;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>Match & Dine</h2>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} style={{ border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>📊 Privire Generală</button>
          <button className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')} style={{ border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>🍽️ Meniul Meu</button>
          <button className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')} style={{ border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>📅 Rezervări</button>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <Link to="/login" className="nav-item" style={{ color: '#E2001A', display: 'block' }}>🚪 Deconectare</Link>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Salutare, {restaurantData?.nume}! 👋</h1>
            <p style={{ color: '#666666', marginTop: '5px' }}>Gestionează-ți restaurantul eficient.</p>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}

export default Dashboard;