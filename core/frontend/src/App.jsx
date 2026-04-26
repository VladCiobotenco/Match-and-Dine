import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import RegisterSuccess from './RegisterSuccess';
import RegisterRestaurant from './RegisterRestaurant';
import Dashboard from './Dashboard';
import OwnerDashboard from './OwnerDashboard';
import Home from './Home';
import Navbar from './Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutele noi adăugate azi */}
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/register-restaurant" element={<RegisterRestaurant />} />
        
        {/* Placeholder pentru viitoarele pagini principale */}
        <Route path="/home" element={<Home />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;