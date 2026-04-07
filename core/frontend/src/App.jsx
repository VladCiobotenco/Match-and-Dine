import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import RegisterSuccess from './RegisterSuccess';
import RegisterRestaurant from './RegisterRestaurant';
import Dashboard from './Dashboard';
import Home from './Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutele noi adăugate azi */}
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/register-restaurant" element={<RegisterRestaurant />} />
        
        {/* Placeholder pentru viitoarele pagini principale */}
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;