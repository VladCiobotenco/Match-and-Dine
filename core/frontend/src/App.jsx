import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import UserProfile from './UserProfile';
import { AuthProvider } from './AuthContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from './PageWrapper';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/register-success" element={<PageWrapper><RegisterSuccess /></PageWrapper>} />
        <Route path="/register-restaurant" element={<PageWrapper><RegisterRestaurant /></PageWrapper>} />
        
        <Route path="/home" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/owner-dashboard" element={<PageWrapper><OwnerDashboard /></PageWrapper>} />
        <Route path="/dashboard/:id" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/food-tinder" element={<PageWrapper><FoodTinder /></PageWrapper>} />
        <Route path="/my-reservations" element={<PageWrapper><MyReservations /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><UserProfile /></PageWrapper>} />
        
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/reset-password/:uid/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Navbar />
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;