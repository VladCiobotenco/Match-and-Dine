import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="login-container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Match & Dine</h1>
      <p>Bine ai venit pe pagina principală!</p>
      <Link to="/dashboard" className="login-button" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '20px' }}>Mergi la Dashboard</Link>
    </div>
  );
}

export default Home;
