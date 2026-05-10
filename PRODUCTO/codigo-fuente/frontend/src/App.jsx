// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import RecuperarContrasena from './components/RecuperarContrasena';
import ResetearContrasena from './components/ResetearContrasena';
import Horario from './components/Horario';

import Layout from './components/Layout';

const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/resetear-contrasena" element={<ResetearContrasena />} />

        <Route path="/dashboard" element={
          <RutaPrivada>
            <Layout>
              <p className="text-gray-400">Bienvenido al Dashboard</p>
            </Layout>
          </RutaPrivada>
        } />

        <Route path="/Horario" element={
          <RutaPrivada>
            <Layout>
              <Horario/>
            </Layout>
          </RutaPrivada>
        } />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;