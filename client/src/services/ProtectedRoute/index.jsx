// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../services/authContex.js";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const { token, tokenExpired } = useAuth();
  const [expired, setExpired] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        const result = await tokenExpired();
        setExpired(result);
      } else {
        setExpired(true);
      }
      setChecking(false);
    };
    verifyToken();
  }, [token]);

  if (checking) return <div>Verificando sessão...</div>;

  if (!token || expired) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
