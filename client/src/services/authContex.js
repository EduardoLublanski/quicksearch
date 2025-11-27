// src/pages/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [username, setUsername] = useState("");

  const login = async (usernameInput, password) => {
  try {
    const res = await axios.post("http://localhost:8080/api/v1/quicksearch/login", { username: usernameInput, password });
    const jwtToken = res.data.token;
    
    setToken(jwtToken);
    localStorage.setItem("jwtToken", jwtToken); // salva no localStorage

    // busca roles
    const rolesRes = await axios.get("http://localhost:8080/api/v1/quicksearch/jwt/me", {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    setRoles(rolesRes.data.roles || []);

    // busca username
    const usernameRes = await axios.get("http://localhost:8080/api/v1/quicksearch/jwt/me/username", {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    setUsername(usernameRes.data.username || "");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

  const logout = () => {
  setToken(null);
  setRoles([]);
  setUsername("");
  localStorage.removeItem("jwtToken");
};

 const tokenExpired = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/v1/quicksearch/jwt", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.expired === "true";
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return true; // em caso de erro, força logout por segurança
  }
};



  const isAuthorized = (role) => roles.includes(role);

  const authAxios = axios.create();
  authAxios.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return (
    <AuthContext.Provider value={{ token, roles, username, login, logout, isAuthorized, authAxios, setToken, tokenExpired }}>
      {children}
    </AuthContext.Provider>
  );
};
