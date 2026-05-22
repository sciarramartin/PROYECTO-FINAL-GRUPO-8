import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const menuItems = [
  { label: "Dashboard", icon: "⊞", path: "/dashboard" },
  { label: "Planificador", icon: "◫", path: "/planificador" },
  { label: "Materias", icon: "▤", path: "/materias" },
  { label: "Calendario", icon: "▦", path: "/calendario" },
  { label: "Horario", icon: "◎", path: "/Horario" },
  { label: "Conexiones", icon: "🔗", path: "/conexiones" },
  { label: "Grupos", icon: "👥", path: "/grupos" },
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
  const [solicitudesAmistadPendientes, setSolicitudesAmistadPendientes] = useState([]);

  // Estados para Invitaciones a Grupos y Dropdown
  const [cantInvitacionesPendientes, setCantInvitacionesPendientes] = useState(0);
  const [invitacionesPendientes, setInvitacionesPendientes] = useState([]);
  const [mostrarCampanitaDropdown, setMostrarCampanitaDropdown] = useState(false);

  // Estados para Mensajes Privados no leídos y Dropdown
  const [cantMensajesPendientes, setCantMensajesPendientes] = useState(0);
  const [mensajesPendientes, setMensajesPendientes] = useState([]);

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

  // Efecto 2: Cargar y Polling de Notificaciones Pendientes (Amistad)
  const cargarPendientes = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/amistades/pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitudesAmistadPendientes(response.data);
      setCantPendientes(response.data.length);
    } catch (error) {
      console.error("Error al obtener notificaciones de amistad:", error);
    }
  };

  // Cargar Invitaciones a Grupos
  const cargarInvitacionesGrupo = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/grupos/invitaciones/pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvitacionesPendientes(response.data);
      setCantInvitacionesPendientes(response.data.length);
    } catch (error) {
      console.error("Error al obtener invitaciones de grupos:", error);
    }
  };

  // Cargar Mensajes Privados no leídos
  const cargarMensajesPendientes = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/chat-privado/notificaciones/pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // FILTRADO LOCAL INSTANTÁNEO SI ESTAMOS EN EL CHAT DE ESTE AMIGO
      const pathParts = window.location.pathname.split("/");
      const esChat = pathParts[1] === "chat-privado";
      const amigoIdChat = esChat ? parseInt(pathParts[2], 10) : null;

      let filtrados = response.data;
      if (esChat && amigoIdChat) {
        filtrados = response.data.filter(m => m.id_remitente !== amigoIdChat);
      }

      setMensajesPendientes(filtrados);
      setCantMensajesPendientes(filtrados.length);
    } catch (error) {
      console.error("Error al obtener notificaciones de mensajes privados:", error);
    }
  };

  useEffect(() => {
    cargarPendientes();
    cargarInvitacionesGrupo();
    cargarMensajesPendientes();
  }, []);

  // Sincronizar notificaciones de chat al cambiar de ruta
  useEffect(() => {
    cargarMensajesPendientes();
  }, [location.pathname]);

  // Handlers para Aceptar / Rechazar Solicitudes de Amistad desde la campana
  const aceptarSolicitudAmistad = async (idUsuarioOrigen) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      await axios.put(`${apiUrl}/amistades/aceptar`, {
        id_usuario_origen: idUsuarioOrigen
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarPendientes();
    } catch (error) {
      console.error("Error al aceptar solicitud de amistad:", error);
    }
  };

  const rechazarSolicitudAmistad = async (idUsuarioOrigen) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      await axios.delete(`${apiUrl}/amistades/eliminar`, {
        data: { id_usuario_b: idUsuarioOrigen },
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarPendientes();
    } catch (error) {
      console.error("Error al rechazar solicitud de amistad:", error);
    }
  };

  // Handlers para Aceptar / Rechazar Invitaciones de Grupos desde la campana
  const aceptarInvitacionGrupo = async (idGrupo) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      await axios.post(`${apiUrl}/grupos/invitaciones/${idGrupo}/aceptar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarInvitacionesGrupo();
      navigate(`/grupos/${idGrupo}`);
    } catch (error) {
      console.error("Error al aceptar invitación de grupo:", error);
    }
  };

  const rejectInvitacionGrupo = async (idGrupo) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      await axios.post(`${apiUrl}/grupos/invitaciones/${idGrupo}/rechazar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await cargarInvitacionesGrupo();
    } catch (error) {
      console.error("Error al rechazar invitación de grupo:", error);
    }
  };

  // Inicialización inmediata y temprana del Socket en la fase de renderizado
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token && usuario?.id && !window.socket) {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const socketUrl = apiUrl.replace('/api', '');
    window.socket = io(socketUrl, {
      query: { userId: usuario.id }
    });
    console.log(`[Socket.io] Conexión establecida de forma temprana para el usuario ${usuario.id}`);
  }

  // Escuchar notificaciones del socket en tiempo real
  useEffect(() => {
    if (window.socket) {
      window.socket.on("connect", () => {
        console.log(`[Socket.io] Conectado exitosamente al servidor como usuario ${usuario.id}`);
      });

      window.socket.on("nueva_solicitud_amistad", () => {
        console.log("[Socket.io] Recibida notificación de nueva solicitud de amistad en tiempo real");
        cargarPendientes();
      });

      window.socket.on("nueva_invitacion_grupo", () => {
        console.log("[Socket.io] Recibida notificación de nueva invitación de grupo en tiempo real");
        cargarInvitacionesGrupo();
      });

      window.socket.on("mensaje_privado", (mensajeNuevo) => {
        console.log("[Socket.io] Recibido nuevo mensaje privado en tiempo real");
        // Solo notificar si no estamos chateando con esa misma persona actualmente
        const pathParts = window.location.pathname.split("/");
        const esChatConRemitente = pathParts[1] === "chat-privado" && parseInt(pathParts[2], 10) === mensajeNuevo.id_remitente;
        
        if (!esChatConRemitente) {
          cargarMensajesPendientes();
        }
      });

      return () => {
        window.socket.off("connect");
        window.socket.off("nueva_solicitud_amistad");
        window.socket.off("nueva_invitacion_grupo");
        window.socket.off("mensaje_privado");
      };
    }
  }, [usuario?.id]);

  const cerrarSesion = () => {
    if (window.socket) {
      window.socket.disconnect();
      window.socket = null;
      console.log("[Socket.io] Conexión cerrada por logout");
    }
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
          <div className="relative">
            <button 
              onClick={() => setMostrarCampanitaDropdown(!mostrarCampanitaDropdown)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer border-none bg-transparent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold">
                  {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes}
                </span>
              )}
            </button>

            {/* Dropdown de la Campana */}
            {mostrarCampanitaDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setMostrarCampanitaDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-3.5 px-4 animate-fade-in">
                  <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Notificaciones</span>
                    {(cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes > 0) && (
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                        {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes} pendientes
                      </span>
                    )}
                  </h3>

                  <div className="mt-2.5 space-y-3 max-h-60 overflow-y-auto pr-1">
                    {/* Solicitudes de Amistad Individuales */}
                    {solicitudesAmistadPendientes.length > 0 ? (
                      solicitudesAmistadPendientes.map((sol) => {
                        const inicialesAmigo = `${sol.usuario?.nombre?.[0] || ""}${sol.usuario?.apellido?.[0] || ""}`.toUpperCase() || "US";
                        return (
                          <div key={sol.id_solicitud} className="p-2.5 bg-indigo-50/30 border border-indigo-100 rounded-xl flex flex-col gap-2 text-left">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold shrink-0">
                                {inicialesAmigo}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10.5px] font-bold text-gray-800 leading-tight">
                                  <span className="text-indigo-650">{sol.usuario?.nombre} {sol.usuario?.apellido}</span> te envió una solicitud de amistad
                                </p>
                                <p className="text-[8.5px] text-gray-400 mt-0.5 truncate">
                                  @{sol.usuario?.nombre_usuario}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 w-full">
                              <button
                                onClick={() => aceptarSolicitudAmistad(sol.usuario?.id)}
                                className="flex-1 text-center py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9.5px] font-bold rounded-lg transition border-none cursor-pointer"
                              >
                                Aceptar
                              </button>
                              <button
                                onClick={() => rechazarSolicitudAmistad(sol.usuario?.id)}
                                className="flex-1 text-center py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[9.5px] font-bold rounded-lg transition border-none cursor-pointer"
                              >
                                Rechazar
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : null}

                    {/* Invitaciones a Grupos */}
                    {invitacionesPendientes.length > 0 ? (
                      invitacionesPendientes.map((inv) => (
                        <div key={inv.id} className="p-2.5 bg-gray-50 border border-gray-150 rounded-xl flex flex-col gap-2.5 text-left">
                          <div className="flex items-start gap-2.5">
                            <span className="text-sm shrink-0">👥</span>
                            <div className="min-w-0">
                              <p className="text-[10.5px] font-bold text-gray-800 leading-tight">
                                Te invitaron al grupo <span className="text-indigo-650">"{inv.Grupo?.nombre}"</span>
                              </p>
                              <p className="text-[9px] text-gray-400 mt-0.5 leading-none">
                                Invitado por @{inv.Grupo?.Creador?.nombre_usuario}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 w-full">
                            <button
                              onClick={() => {
                                aceptarInvitacionGrupo(inv.id_grupo);
                                setMostrarCampanitaDropdown(false);
                              }}
                              className="flex-1 text-center py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9.5px] font-bold rounded-lg transition border-none cursor-pointer"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => {
                                rejectInvitacionGrupo(inv.id_grupo);
                              }}
                              className="flex-1 text-center py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[9.5px] font-bold rounded-lg transition border-none cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))
                    ) : null}

                    {/* Mensajes Privados no leídos */}
                    {mensajesPendientes.length > 0 ? (
                      (() => {
                        // Agrupar por id_remitente
                        const agrupados = {};
                        mensajesPendientes.forEach((msg) => {
                          const idRem = msg.id_remitente;
                          if (!agrupados[idRem]) {
                            agrupados[idRem] = {
                              id_remitente: idRem,
                              Remitente: msg.Remitente,
                              cantidad: 0,
                              id: msg.id
                            };
                          }
                          agrupados[idRem].cantidad += 1;
                        });
                        
                        return Object.values(agrupados).map((grupo) => {
                          const inicialesRemitente = `${grupo.Remitente?.nombre?.[0] || ""}${grupo.Remitente?.apellido?.[0] || ""}`.toUpperCase() || "US";
                          return (
                            <div 
                              key={grupo.id} 
                              onClick={() => {
                                setMostrarCampanitaDropdown(false);
                                setCantMensajesPendientes(prev => Math.max(0, prev - grupo.cantidad));
                                setMensajesPendientes(prev => prev.filter(m => m.id_remitente !== grupo.id_remitente));
                                navigate(`/chat-privado/${grupo.id_remitente}`);
                              }}
                              className="p-2.5 bg-green-50/40 hover:bg-green-50/70 border border-green-100 rounded-xl flex items-start gap-2.5 cursor-pointer transition text-left"
                              title="Haz clic para chatear"
                            >
                              <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 text-[10px] font-bold shrink-0">
                                {inicialesRemitente}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10.5px] font-bold text-gray-800 leading-tight">
                                  Mensajes nuevos de <span className="text-green-700">{grupo.Remitente?.nombre} {grupo.Remitente?.apellido}</span>
                                </p>
                                <p className="text-[9.5px] text-gray-500 mt-1 font-semibold leading-none flex items-center gap-1">
                                  <span>💬 Tienes {grupo.cantidad} {grupo.cantidad === 1 ? "mensaje pendiente" : "mensajes pendientes"}</span>
                                </p>
                              </div>
                            </div>
                          );
                        });
                      })()
                    ) : null}

                    {cantPendientes === 0 && invitacionesPendientes.length === 0 && mensajesPendientes.length === 0 && (
                      <p className="text-[10px] text-gray-400 text-center py-6 select-none">
                        No tienes notificaciones pendientes.
                      </p>
                    )}
                  </div>

                  {(cantPendientes > 0 || invitacionesPendientes.length > 0 || mensajesPendientes.length > 0) && (
                    <div className="border-t border-gray-100 mt-3 pt-2.5 flex justify-center">
                      <button
                        onClick={() => {
                          setMostrarCampanitaDropdown(false);
                          navigate("/conexiones");
                        }}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold transition flex items-center gap-1 cursor-pointer bg-transparent border-none"
                      >
                        Gestionar todas las conexiones ➔
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

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
                  {esConexiones && cantPendientes + cantMensajesPendientes > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {cantPendientes + cantMensajesPendientes}
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