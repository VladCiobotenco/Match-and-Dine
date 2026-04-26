import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import RegisterSuccess from './RegisterSuccess';
import RegisterRestaurant from './RegisterRestaurant';
import Dashboard from './Dashboard';
import Home from './Home';
import Navbar from './Navbar'; // Importăm noul Navbar

function App() {
  return (
    <BrowserRouter>
      {/* Bara de navigație va sta mereu deasupra conținutului */}
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/register-restaurant" element={<RegisterRestaurant />} />
        
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;