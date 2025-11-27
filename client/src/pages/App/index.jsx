import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from 'antd';

import TopBar from '../TopBar';
import Cliente from '../Cliente';
import Advogado from '../Advogado';
import Processos from '../Processos';
import ProcessosAdvogado from '../ProcessosAdvogado';
import ProcessosPage from '../ProcessosPage';
import Login from '../Login';
import ProtectedRoute from '../../services/ProtectedRoute';
import Usuario from '../Usuario';
import { useAuth } from '../../services/authContex'; // <-- importa o hook de autenticação

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const { setToken } = useAuth(); // <-- pega o setToken do contexto

  useEffect(() => {
    const savedToken = localStorage.getItem("jwtToken");
    if (savedToken) {
      setToken(savedToken);
    }
  }, [setToken]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isLoginPage && <TopBar />}
      <Layout.Content style={{ padding: '24px' }}>
        <Routes>
          <Route 
            path="/cliente" 
            element={<ProtectedRoute><Cliente /></ProtectedRoute>} 
          />
          <Route 
            path="/advogado" 
            element={<ProtectedRoute><Advogado /></ProtectedRoute>} 
          />
          <Route 
            path="/cliente/:cpf/processos" 
            element={<ProtectedRoute><Processos /></ProtectedRoute>} 
          />
          <Route 
            path="/advogado/:codigoOAB/processos" 
            element={<ProtectedRoute><ProcessosAdvogado /></ProtectedRoute>} 
          />
          <Route 
            path="/processos" 
            element={<ProtectedRoute><ProcessosPage /></ProtectedRoute>} 
          />
          <Route path="/" element={<Login />} />
          <Route 
            path="/usuario" 
            element={<ProtectedRoute><Usuario /></ProtectedRoute>} 
          />
        </Routes>
      </Layout.Content>
    </Layout>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
