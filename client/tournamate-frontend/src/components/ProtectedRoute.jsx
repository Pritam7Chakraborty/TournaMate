// src/components/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) {
    // If no token exists, redirect the user to the login page
    return <Navigate to="/login" replace />;
  }

  // If a token exists, render the component they were trying to access
  return children;
}

export default ProtectedRoute;