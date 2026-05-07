import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // La încărcarea aplicației, verificăm localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const ownerStatus = localStorage.getItem('isOwner') === 'true';
    if (token && token !== 'undefined' && token !== 'null') {
      setIsLoggedIn(true);
      setIsOwner(ownerStatus);
    }
  }, []);

  const login = (token, ownerStatus, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('isOwner', ownerStatus);
    if (email) localStorage.setItem('userEmail', email);
    setIsLoggedIn(true);
    setIsOwner(ownerStatus === 'true' || ownerStatus === true);
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsOwner(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isOwner, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};