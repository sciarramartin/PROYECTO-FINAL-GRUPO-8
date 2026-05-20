// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/ModuloSesion/Login';
import RecuperarContrasena from './components/ModuloSesion/RecuperarContrasena';
import ResetearContrasena from './components/ModuloSesion/ResetearContrasena';
import Registro from './components/ModuloSesion/Registro';
import Horario from './components/Us-8-Actividades-Personales/Horario';
import Layout from './components/Layout';
import ModuloCorrelativas from './components/Us-9-Registrar-Correlativas';
import PerfilPublico from './components/MoludoPerfil-Amigos/PerfilPublico';
import MisConexiones from './components/MoludoPerfil-Amigos/MisConexiones';

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

        {/* Ruta temporal para probar tu User Story */}
        <Route path="/correlativas" element={<ModuloCorrelativas />} />

        <Route path="/conexiones" element={
          <RutaPrivada>
            <Layout>
              <MisConexiones />
            </Layout>
          </RutaPrivada>
        } />

        <Route path="/perfil/:id" element={
          <RutaPrivada>
            <Layout>
              <PerfilPublico />
            </Layout>
          </RutaPrivada>
        } />

        <Route path="/Horario" element={
          //<RutaPrivada>
          <Layout>
            <Horario />
          </Layout>
          //</RutaPrivada>
        } />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;