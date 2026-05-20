import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const menuItems = [
  { label: "Dashboard", icon: "⊞", path: "/dashboard" },
  { label: "Planificador", icon: "◫", path: "/planificador" },
  { label: "Materias", icon: "▤", path: "/materias" },
  { label: "Calendario", icon: "▦", path: "/calendario" },
  { label: "Horario", icon: "◎", path: "/Horario" },
  { label: "Conexiones", icon: "👥", path: "/conexiones" },
  { label: "Reportes", icon: "◈", path: "/reportes" },
  { label: "Ajustes", icon: "◍", path: "/ajustes" },
];

const Layout = ({ children }) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Estados del Buscador Global (Lupita)
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Estado del Badge de Notificación de Amistad
  const [cantPendientes, setCantPendientes] = useState(0);

  const usuario = JSON.parse(
    localStorage.getItem("usuario") || sessionStorage.getItem("usuario") || "{}"
  );

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "US";

  // Efecto 1: Búsqueda Global Debounced (300ms)
  useEffect(() => {
    if (!busqueda.trim()) {
      setResultados([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setCargandoBusqueda(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await axios.get(`${apiUrl}/usuarios/buscar`, {
          params: { q: busqueda },
          headers: { Authorization: `Bearer ${token}` }
        });
        setResultados(response.data);
      } catch (error) {
        console.error("Error al buscar usuarios en Layout:", error);
      } finally {
        setCargandoBusqueda(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda]);

  // Efecto 2: Cargar y Polling de Notificaciones Pendientes
  const cargarPendientes = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/amistades/pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCantPendientes(response.data.length);
    } catch (error) {
      console.error("Error al obtener notificaciones de amistad:", error);
    }
  };

  useEffect(() => {
    cargarPendientes();
    // Consultar cada 30 segundos
    const interval = setInterval(cargarPendientes, 30000);
    return () => clearInterval(interval);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans inline-block min-w-full">

      {/* HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 fixed top-0 left-0 right-0 z-30">

        {/* Logo + hamburguesa mobile */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <div>
              <p className="text-base font-bold text-gray-900 leading-none">Campus</p>
              <p className="text-xs text-gray-400 leading-none">Planificá tu cursada</p>
            </div>
          </div>
        </div>

        {/* BUSCADOR GLOBAL (LUPITA) RESPONSIVE */}
        <div className="flex-1 max-w-xs md:max-w-md mx-4 md:mx-12 relative">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setMostrarSugerencias(true);
              }}
              onFocus={() => setMostrarSugerencias(true)}
              onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
              placeholder="Buscar compañeros..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-indigo-500 outline-none transition"
            />
            {busqueda && (
              <button 
                onClick={() => { setBusqueda(""); setResultados([]); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Panel Flotante de Sugerencias */}
          {mostrarSugerencias && (busqueda.trim() || cargandoBusqueda) && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {cargandoBusqueda ? (
                <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                  <span className="animate-spin text-sm">⌛</span> Buscando compañeros...
                </div>
              ) : resultados.length > 0 ? (
                <div className="py-1">
                  {resultados.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setMostrarSugerencias(false);
                        setBusqueda("");
                        navigate(`/perfil/${user.id}`);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0 transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                        {user.nombre[0].toUpperCase()}{user.apellido[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
                          {user.nombre} {user.apellido}
                        </p>
                        <p className="text-xs text-gray-400 leading-none truncate">
                          @{user.nombre_usuario}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-400">
                  No se encontraron compañeros.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Derecha: campana + usuario */}
        <div className="flex items-center gap-3">

          {/* Campana */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Usuario */}
          <div className="relative">
            <button
              onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {iniciales}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-none">{usuario?.nombre || "Usuario"}</p>
                <p className="text-xs text-gray-400">Estudiante</p>
              </div>
              <span className="text-gray-400 text-xs">▾</span>
            </button>

            {/* Dropdown usuario */}
            {menuUsuarioAbierto && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <button
                  onClick={cerrarSesion}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">

        {/* OVERLAY mobile */}
        {sidebarAbierto && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
            onClick={() => setSidebarAbierto(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-52 bg-white border-r border-gray-200
          flex flex-col justify-between z-20 transition-transform duration-300
          ${sidebarAbierto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}>
          <nav className="p-3 flex flex-col gap-1 mt-2">
            {menuItems.map((item) => {
              const activo = location.pathname === item.path;
              const esConexiones = item.path === "/conexiones";
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarAbierto(false); }}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition w-full text-left
                    ${activo
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </div>

                  {/* GLOBITO DE SOLICITUDES PENDIENTES */}
                  {esConexiones && cantPendientes > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold animate-pulse shrink-0">
                      {cantPendientes}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Cerrar sesión abajo */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition w-full text-left"
            >
              <span className="text-base">→</span>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="flex-1 md:ml-52 p-6 min-h-full">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;