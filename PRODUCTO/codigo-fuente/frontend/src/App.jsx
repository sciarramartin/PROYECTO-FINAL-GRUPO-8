// frontend/src/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Spinner from './components/common/Spinner';

const Login = lazy(() => import('./components/ModuloSesion/Login'));
const RecuperarContrasena = lazy(() => import('./components/ModuloSesion/RecuperarContrasena'));
const ResetearContrasena = lazy(() => import('./components/ModuloSesion/ResetearContrasena'));
const Registro = lazy(() => import('./components/ModuloSesion/Registro'));
const Horario = lazy(() => import('./components/Us-8-Actividades-Personales/Horario'));
const ModuloCorrelativas = lazy(() => import('./components/Us-9-Registrar-Correlativas'));
const MapaCorrelatividades = lazy(() => import('./components/US-10-Consultar-correlativas/MapaCorrelatividades'));
const Planificador = lazy(()=> import('./components/Us-7-Generar-planificacion/Planificador'));
const PerfilPublico = lazy(() => import('./components/modulo-perfil-amigos/perfil-publico'));
const MisConexiones = lazy(() => import('./components/modulo-perfil-amigos/mis-conexiones'));
const MiPerfil = lazy(() => import('./components/modulo-perfil-amigos/mi-perfil'));
const ListaGrupos = lazy(() => import('./components/us-10-grupos/lista-grupos'));
const MuroGrupo = lazy(() => import('./components/us-10-grupos/muro-grupo'));
const ChatPrivado = lazy(() => import('./components/us-11-chat-privado/chat-privado'));
const ListaForos = lazy(() => import('./components/us-foro/ListaForos'));
const MuroForo = lazy(() => import('./components/us-foro/MuroForo'));
const DetallePublicacion = lazy(() => import('./components/us-foro/DetallePublicacion'));

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
            <RutaPrivada>
              <Layout>
                <Horario/>
              </Layout>
            </RutaPrivada>
          } />

          <Route path="/Planificador" element={
            <RutaPrivada>
              <Layout>
                <Planificador/>
              </Layout>
            </RutaPrivada>
          } />

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

          <Route path="/grupos" element={
            <RutaPrivada>
              <Layout>
                <ListaGrupos />
              </Layout>
            </RutaPrivada>
          } />

          <Route path="/grupos/:id" element={
            <RutaPrivada>
              <Layout>
                <MuroGrupo />
              </Layout>
            </RutaPrivada>
          } />

          <Route path="/chat-privado/:amigoId" element={
            <RutaPrivada>
              <Layout>
                <ChatPrivado />
              </Layout>
            </RutaPrivada>
          } />

          <Route path="/mi-perfil" element={
            <RutaPrivada>
              <Layout>
                <MiPerfil />
              </Layout>
            </RutaPrivada>
          } />

          {/* Rutas de Foros */}
          <Route path="/foros" element={
            <RutaPrivada>
              <Layout>
                <ListaForos />
              </Layout>
            </RutaPrivada>
          } />

          <Route path="/foros/:materiaId" element={
            <RutaPrivada>
              <Layout>
                <MuroForo />
              </Layout>
            </RutaPrivada>
          } />

          <Route path="/foros/:materiaId/publicacion/:postId" element={
            <RutaPrivada>
              <Layout>
                <DetallePublicacion />
              </Layout>
            </RutaPrivada>
          } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;