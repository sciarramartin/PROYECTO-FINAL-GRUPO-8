// frontend/src/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Spinner from './components/common/Spinner';

const Login = lazy(() => import('./components/ModuloSesion/Login'));
const RecuperarContrasena = lazy(() => import('./components/RecuperarContrasena'));
const ResetearContrasena = lazy(() => import('./components/ResetearContrasena'));
const Registro = lazy(() => import('./components/ModuloSesion/Registro'));
const Horario = lazy(() => import('./components/Us-8-Actividades-Personales/Horario'));
const ModuloCorrelativas = lazy(() => import('./components/Us-9-Registrar-Correlativas'));
const MapaCorrelatividades = lazy(() => import('./components/US-10-Consultar-correlativas/MapaCorrelatividades'));
const Planificador = lazy(()=> import('./components/Us-7-Generar-planificacion/Planificador'));

const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
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

        <Route path="/Planificador" element={
          //<RutaPrivada>
            <Layout>
              <Planificador/>
            </Layout>
          //</RutaPrivada>
        } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;