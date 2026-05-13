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
      try {
        // Decodificăm payload-ul token-ului (partea din mijloc) pentru a extrage data de expirare
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const payload = JSON.parse(decodedJson);
        
        // Verificăm dacă timpul curent este mai mare decât timpul de expirare (înmulțit cu 1000 pentru milisecunde)
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          logout(); // Ștergem automat datele dacă a expirat
        } else {
          setIsLoggedIn(true);
          setIsOwner(ownerStatus);
        }
      } catch (error) {
        logout(); // În cazul în care token-ul este corupt/modificat greșit, delogăm utilizatorul
      }
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