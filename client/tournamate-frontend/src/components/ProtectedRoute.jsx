// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

/**
 * ProtectedRoute - defensive, simple.
 * Renders children only if user or token exists.
 */
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext) || {};
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
