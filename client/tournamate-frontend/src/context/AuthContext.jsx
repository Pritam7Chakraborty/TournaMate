// src/context/AuthContext.jsx
import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // This function will be called from LoginPage
  const loginAction = (data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    // You would typically decode the token to get user info
    // For now, we'll just set a placeholder user
    setUser({ email: 'user@example.com' }); // Placeholder
    navigate('/tournaments');
  };

  // This function will be used later
  const logoutAction = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, loginAction, logoutAction }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;