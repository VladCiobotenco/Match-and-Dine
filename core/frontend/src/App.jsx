import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import RegisterSuccess from './RegisterSuccess';
import RegisterRestaurant from './RegisterRestaurant';
import Dashboard from './Dashboard';
import OwnerDashboard from './OwnerDashboard';
import Home from './Home';
import Navbar from './Navbar';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import FoodTinder from './FoodTinder';
import MyReservations from './MyReservations';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutele noi adăugate azi */}
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/register-restaurant" element={<RegisterRestaurant />} />
        
        {/* Placeholder pentru viitoarele pagini principale */}
        <Route path="/home" element={<Home />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/food-tinder" element={<FoodTinder />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        
        {/* Rute pentru resetarea parolei */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;