// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/ModuloSesion/Login';
import RecuperarContrasena from './components/RecuperarContrasena';
import ResetearContrasena from './components/ResetearContrasena';
import Registro from './components/ModuloSesion/Registro';
import Horario from './components/Us-8-Actividades-Personales/Horario';
import Layout from './components/Layout';
import ModuloCorrelativas from './components/Us-9-Registrar-Correlativas';
import MapaCorrelatividades from './components/US-10-Consultar-correlativas/MapaCorrelatividades';

const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/resetear-contrasena" element={<ResetearContrasena />} />

        <Route path="/dashboard" element={
          <RutaPrivada>
            <Layout>
              <p className="text-gray-400">Bienvenido al Dashboard</p>
            </Layout>
          </RutaPrivada>
        } />
        
        {/* Rutas de Correlatividades */}
        <Route path="/correlativas" element={
          <RutaPrivada>
            <Layout>
              <ModuloCorrelativas />
            </Layout>
          </RutaPrivada>
        } />

        <Route path="/mapa-correlatividades" element={
          <RutaPrivada>
            <Layout>
              <MapaCorrelatividades />
            </Layout>
          </RutaPrivada>
        } />

        <Route path="/Horario" element={
          //<RutaPrivada>
            <Layout>
              <Horario/>
            </Layout>
          //</RutaPrivada>
        } />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;