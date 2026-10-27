import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  FiGrid,
  FiCompass,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiBarChart2,
  FiSettings,
  FiGitMerge,
  FiPlusCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiUsers,
  FiShare2,
  FiMessageSquare,
  FiCpu,
  FiStar,
  FiTrello,
  FiChevronLeft,
  FiChevronRight,
  FiPieChart,
  FiFolder,
  FiActivity
} from "react-icons/fi";

import { RiRobot2Line } from "react-icons/ri";
import { 
  BsCalendarWeek,
  BsChatRightDots
 } from "react-icons/bs";

const menuItems = [
  { label: "Dashboard", icon: <FiPieChart />, path: "/dashboard" },
  { label: "Asistente IA", icon: <RiRobot2Line />, path: "/asistente-ia" },
  { label: "Planificador", icon: <BsCalendarWeek />, path: "/planificador" },
  { label: "Materias", icon: <FiBookOpen />, path: "/materias" },
  { label: "Horario", icon: <FiClock />, path: "/Horario" },
  { label: "Conexiones", icon: <FiShare2 />, path: "/conexiones" },
  { label: "Grupos", icon: <FiUsers />, path: "/grupos" },
  { label: "Foros", icon: <BsChatRightDots />, path: "/foros" },
  { label: "Repositorio", icon: <FiFolder />, path: "/repositorio" },
  { label: "Métricas Globales", icon: <FiActivity />, path: "/metricas-globales", role: 3 },
  { label: "Reportes", icon: <FiBarChart2 />, path: "/reportes", role: 3 },
  { label: "Mapa Correlativas", icon: <FiTrello />, path: "/mapa-correlatividades", role: 1 },
  { label: "Registrar Correlativas", icon: <FiPlusCircle />, path: "/correlativas", role: 3 },
  { label: "Reseñas", icon: <FiStar />, path: "/resenas" }
];

const Layout = ({ children }) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  
  // Persistencia del menú colapsado
  const [sidebarColapsado, setSidebarColapsado] = useState(() => {
    return localStorage.getItem("sidebarColapsado") === "true";
  });

  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(() => {
    const guardado = localStorage.getItem("theme");
    if (guardado) return guardado === "dark";
    return false;
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Estados del Buscador Global (Lupita)
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Estados de Notificaciones y Badges
  const [cantPendientes, setCantPendientes] = useState(0);
  const [solicitudesAmistadPendientes, setSolicitudesAmistadPendientes] = useState([]);
  const [cantInvitacionesPendientes, setCantInvitacionesPendientes] = useState(0);
  const [invitacionesPendientes, setInvitacionesPendientes] = useState([]);
  const [mostrarCampanitaDropdown, setMostrarCampanitaDropdown] = useState(false);
  const [cantMensajesPendientes, setCantMensajesPendientes] = useState(0);
  const [mensajesPendientes, setMensajesPendientes] = useState([]);
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [cantGruposMensajesPendientes, setCantGruposMensajesPendientes] = useState(0);
  const [gruposMensajesPendientes, setGruposMensajesPendientes] = useState([]);

  let usuario = {};
  try {
    const usuarioStr = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
    if (usuarioStr && usuarioStr !== "undefined") {
      usuario = JSON.parse(usuarioStr);
    }
  } catch (e) {
    console.error("Error parseando usuario:", e);
  }

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "US";

  useEffect(() => {
    if (temaOscuro) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [temaOscuro]);

  const toggleTema = () => setTemaOscuro(!temaOscuro);

  const renderAvatarChico = (foto, inicialesStr, sizeClass = "w-8 h-8 text-xs") => {
    if (!foto) {
      return (
        <div className={`${sizeClass} rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0`}>
          {inicialesStr}
        </div>
      );
    }
    if (foto.length <= 4) {
      const emojiSize = sizeClass.includes("w-10") ? "text-xl" : "text-sm";
      return (
        <div className={`${sizeClass} rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center shrink-0 ${emojiSize}`}>
          {foto}
        </div>
      );
    }
    const src = foto.startsWith('data:') ? foto : `data:image/jpeg;base64,${foto}`;
    return (
      <img
        src={src}
        alt="Avatar"
        className={`${sizeClass} rounded-full object-cover border border-gray-250 shrink-0`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '';
          e.target.outerHTML = `<div class="${sizeClass} rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">${inicialesStr}</div>`;
        }}
      />
    );
  };

  // ── Búsqueda Global ───────────────────────────────────────────────────────
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

  // ── Carga de Notificaciones ───────────────────────────────────────────────
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

  const cargarMensajesPendientes = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/chat-privado/notificaciones/pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

  const cargarGruposMensajesPendientes = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/grupos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userId = usuario?.id;
      if (!userId) return;
      const ultimosVistos = JSON.parse(localStorage.getItem(`grupo_ultimo_visto_${userId}`) || "{}");

      const unreadGroups = response.data.filter(grupo => {
        const ultMsg = grupo.ultimoMensaje;
        if (!ultMsg) return false;
        const esMio = Number(ultMsg.id_usuario) === Number(userId);
        if (esMio) return false;

        const pathParts = window.location.pathname.split("/");
        const esMuroGrupo = pathParts[1] === "grupos" && pathParts[2] !== undefined && Number(pathParts[2]) === Number(grupo.id);
        if (esMuroGrupo) {
          ultimosVistos[grupo.id] = ultMsg.id;
          localStorage.setItem(`grupo_ultimo_visto_${userId}`, JSON.stringify(ultimosVistos));
          return false;
        }

        let ultimoVistoId = ultimosVistos[grupo.id] || 0;
        return Number(ultMsg.id) > Number(ultimoVistoId);
      });

      setGruposMensajesPendientes(unreadGroups);
      setCantGruposMensajesPendientes(unreadGroups.length);
    } catch (error) {
      console.error("Error al cargar mensajes pendientes de grupos:", error);
    }
  };

  const cargarFotoPerfilPropia = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await axios.get(`${apiUrl}/perfiles/mi-perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.perfil?.foto_perfil) {
        setFotoPerfil(res.data.perfil.foto_perfil);
      } else {
        setFotoPerfil("");
      }
    } catch (err) {
      console.error("Error al obtener foto propia en Layout:", err);
    }
  };

  useEffect(() => {
    cargarPendientes();
    cargarInvitacionesGrupo();
    cargarMensajesPendientes();
    cargarGruposMensajesPendientes();
    cargarFotoPerfilPropia();
  }, []);

  useEffect(() => {
    cargarMensajesPendientes();
    cargarGruposMensajesPendientes();
    cargarFotoPerfilPropia();
  }, [location.pathname]);

  // Evento leído grupo
  useEffect(() => {
    const handleGrupoLeido = () => cargarGruposMensajesPendientes();
    window.addEventListener("grupo_leido", handleGrupoLeido);
    return () => window.removeEventListener("grupo_leido", handleGrupoLeido);
  }, [usuario?.id]);

  // Handlers Amistad y Grupos
  const aceptarSolicitudAmistad = async (idUsuarioOrigen) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      await axios.put(`${apiUrl}/amistades/aceptar`, { id_usuario_origen: idUsuarioOrigen }, { headers: { Authorization: `Bearer ${token}` } });
      await cargarPendientes();
    } catch (error) { console.error(error); }
  };

  const rechazarSolicitudAmistad = async (idUsuarioOrigen) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      await axios.delete(`${apiUrl}/amistades/eliminar`, { data: { id_usuario_b: idUsuarioOrigen }, headers: { Authorization: `Bearer ${token}` } });
      await cargarPendientes();
    } catch (error) { console.error(error); }
  };

  const aceptarInvitacionGrupo = async (idGrupo) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      await axios.post(`${apiUrl}/grupos/invitaciones/${idGrupo}/aceptar`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await cargarInvitacionesGrupo();
      navigate(`/grupos/${idGrupo}`);
    } catch (error) { console.error(error); }
  };

  const rejectInvitacionGrupo = async (idGrupo) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      await axios.post(`${apiUrl}/grupos/invitaciones/${idGrupo}/rechazar`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await cargarInvitacionesGrupo();
    } catch (error) { console.error(error); }
  };

  // ── Sockets ───────────────────────────────────────────────────────────────
  const tokenVal = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (tokenVal && usuario?.id && !window.socket) {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const socketUrl = apiUrl.replace('/api', '');
    window.socket = io(socketUrl, { query: { userId: usuario.id } });
  }

  useEffect(() => {
    if (window.socket) {
      window.socket.on("nueva_solicitud_amistad", () => cargarPendientes());
      window.socket.on("actualizar_amistad", () => cargarPendientes());
      window.socket.on("nueva_invitacion_grupo", () => cargarInvitacionesGrupo());
      window.socket.on("mensaje_privado", (mensajeNuevo) => {
        const pathParts = window.location.pathname.split("/");
        const esChatConRemitente = pathParts[1] === "chat-privado" && parseInt(pathParts[2], 10) === mensajeNuevo.id_remitente;
        if (!esChatConRemitente) cargarMensajesPendientes();
      });
      window.socket.on("nuevo_mensaje_grupo_notificacion", (data) => {
        const pathParts = window.location.pathname.split("/");
        const esMuroDeEsteGrupo = pathParts[1] === "grupos" && pathParts[2] !== undefined && Number(pathParts[2]) === Number(data.id_grupo);
        if (!esMuroDeEsteGrupo) cargarGruposMensajesPendientes();
      });

      return () => {
        if (window.socket) {
          window.socket.off("nueva_solicitud_amistad");
          window.socket.off("actualizar_amistad");
          window.socket.off("nueva_invitacion_grupo");
          window.socket.off("mensaje_privado");
          window.socket.off("nuevo_mensaje_grupo_notificacion");
        }
      };
    }
  }, [usuario?.id]);

  const cerrarSesion = () => {
    if (window.socket) {
      window.socket.disconnect();
      window.socket = null;
    }
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">

      {/* HEADER */}
      <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 md:px-6 fixed top-0 left-0 right-0 z-30 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
          >
            {sidebarAbierto ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <img 
                src="/CampusUTN-logo.png" 
                alt="Logo Campus UTN"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-slate-50 leading-none">Campus</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Planificá tu cursada</p>
            </div>
          </div>
        </div>

        {/* BUSCADOR GLOBAL */}
        <div className="flex-1 max-w-xs md:max-w-md mx-4 md:mx-12 relative">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setMostrarSugerencias(true); }}
              onFocus={() => setMostrarSugerencias(true)}
              onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
              placeholder="Buscar compañeros..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none transition-colors duration-200 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            {busqueda && (
              <button onClick={() => { setBusqueda(""); setResultados([]); }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">✕</button>
            )}
          </div>

          {mostrarSugerencias && (busqueda.trim() || cargandoBusqueda) && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {cargandoBusqueda ? (
                <div className="p-4 text-center text-xs text-slate-400">Buscando compañeros...</div>
              ) : resultados.length > 0 ? (
                <div className="py-1">
                  {resultados.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => { setMostrarSugerencias(false); setBusqueda(""); navigate(`/perfil/${user.id}`); }}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-slate-800/70 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800/50 transition-colors duration-200"
                    >
                      {renderAvatarChico(user.Perfil?.foto_perfil || user.perfil?.foto_perfil, `${user.nombre[0]}${user.apellido[0]}`.toUpperCase())}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.nombre} {user.apellido}</p>
                        <p className="text-xs text-slate-400 truncate">@{user.nombre_usuario}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">No se encontraron compañeros.</div>
              )}
            </div>
          )}
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={toggleTema} className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
            {temaOscuro ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          {/* CAMPANA NOTIFICACIONES */}
          <div className="relative">
            <button onClick={() => setMostrarCampanitaDropdown(!mostrarCampanitaDropdown)} className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-200">
              <FiBell className="w-5 h-5" />
              {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes + cantGruposMensajesPendientes > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold">
                  {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes + cantGruposMensajesPendientes}
                </span>
              )}
            </button>

            {mostrarCampanitaDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMostrarCampanitaDropdown(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-3.5 px-4 max-h-96 overflow-y-auto">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                    <span>Notificaciones</span>
                  </h3>

                  {/* Solicitudes Amistad */}
                  {cantPendientes > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Amistades ({cantPendientes})</p>
                      <div className="mt-1 space-y-1">
                        {solicitudesAmistadPendientes.map((sol) => {
                          const amigo = sol.usuario || sol.UsuarioOrigen || {};
                          return (
                            <div key={sol.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex flex-col gap-1">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{amigo.nombre} {amigo.apellido}</p>
                              <div className="flex gap-1">
                                <button onClick={() => aceptarSolicitudAmistad(amigo.id)} className="flex-1 py-0.5 bg-green-600 text-white rounded text-[9px] font-bold">Aceptar</button>
                                <button onClick={() => rechazarSolicitudAmistad(amigo.id)} className="flex-1 py-0.5 bg-red-600 text-white rounded text-[9px] font-bold">Rechazar</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Invitaciones Grupos */}
                  {cantInvitacionesPendientes > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Grupos ({cantInvitacionesPendientes})</p>
                      <div className="mt-1 space-y-1">
                        {invitacionesPendientes.map((inv) => (
                          <div key={inv.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex flex-col gap-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{inv.Grupo?.nombre}</p>
                            <div className="flex gap-1">
                              <button onClick={() => aceptarInvitacionGrupo(inv.Grupo?.id)} className="flex-1 py-0.5 bg-green-600 text-white rounded text-[9px] font-bold">Aceptar</button>
                              <button onClick={() => rejectInvitacionGrupo(inv.Grupo?.id)} className="flex-1 py-0.5 bg-red-600 text-white rounded text-[9px] font-bold">Rechazar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes + cantGruposMensajesPendientes === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400">Sin notificaciones pendientes.</div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* USUARIO */}
          <div className="relative">
            <button onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)} className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl p-1.5 transition-colors duration-200">
              {renderAvatarChico(fotoPerfil, iniciales)}
              <div className="hidden md:block text-left select-none max-w-[120px]">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{usuario?.nombre || "Usuario"}</p>
                <p className="text-[10px] text-slate-400">{usuario?.id_tipo_usuario === 3 ? "Administrador" : "Estudiante"}</p>
              </div>
              <FiChevronDown className={`text-slate-400 w-3 h-3 transition-transform ${menuUsuarioAbierto ? 'rotate-180' : ''}`} />
            </button>

            {menuUsuarioAbierto && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuUsuarioAbierto(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50">
                  <button onClick={() => { setMenuUsuarioAbierto(false); navigate("/mi-perfil"); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2">👤 Mi Perfil</button>
                  <button onClick={() => { cerrarSesion(); setMenuUsuarioAbierto(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"><FiLogOut /> Cerrar sesión</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">

        {sidebarAbierto && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden" onClick={() => setSidebarAbierto(false)} />}

        {/* SIDEBAR COLAPSIBLE */}
        <aside className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80
          flex flex-col justify-between z-20 transition-all duration-300
          ${sidebarAbierto ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0"}
          ${sidebarColapsado ? "md:w-20" : "md:w-60"}
        `}>
          <div className="flex flex-col h-full justify-between">
            <nav className="p-3.5 flex flex-col gap-1.5 mt-2 overflow-y-auto">
              {menuItems.filter(item => !item.role || item.role === usuario?.id_tipo_usuario).map((item) => {
                const activo = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => { 
                      navigate(item.path); 
                      if (window.innerWidth < 768) setSidebarAbierto(false); 
                    }}
                    title={sidebarColapsado ? item.label : ""}
                    className={`
                      flex items-center ${sidebarColapsado ? "justify-center" : "justify-between"} px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full relative group
                      ${activo ? "bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"}
                    `}
                  >
                    {activo && <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-indigo-500" />}
                    <div className={`flex items-center gap-3 ${sidebarColapsado ? "justify-center" : ""}`}>
                      <span className={`text-xl transition-transform group-hover:scale-110 ${activo ? "text-indigo-500" : "text-slate-400"}`}>
                        {item.icon}
                      </span>
                      {!sidebarColapsado && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarColapsado && item.path === "/conexiones" && cantPendientes + cantMensajesPendientes > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {cantPendientes + cantMensajesPendientes}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* BOTÓN INFERIOR DE COLAPSO Y LOGOUT */}
            <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2">
              <button
                onClick={() => {
                  const nuevo = !sidebarColapsado;
                  setSidebarColapsado(nuevo);
                  localStorage.setItem("sidebarColapsado", nuevo);
                }}
                className="hidden md:flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 w-full cursor-pointer"
              >
                {sidebarColapsado ? <FiChevronRight className="w-4 h-4" /> : <><FiChevronLeft className="w-4 h-4" /><span>Colapsar menú</span></>}
              </button>

              <button
                onClick={cerrarSesion}
                className={`flex items-center ${sidebarColapsado ? "justify-center" : "gap-3"} px-3.5 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200 w-full`}
                title={sidebarColapsado ? "Cerrar sesión" : ""}
              >
                <FiLogOut className="text-lg shrink-0" />
                {!sidebarColapsado && <span>Cerrar sesión</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* CONTENEDOR PRINCIPAL */}
        <main className={`flex-1 transition-all duration-300 ${
          sidebarColapsado ? "md:ml-20" : "md:ml-60"
        } ${
          location.pathname === "/asistente-ia" ? "p-2 sm:p-3 md:p-4 h-[calc(100vh-4rem)] overflow-hidden flex flex-col" : "p-4 md:p-8 min-h-full"
        } bg-slate-50 dark:bg-slate-950`}>
          <div className={location.pathname === "/asistente-ia" ? "w-full h-full flex flex-col min-h-0 max-w-[1850px] mx-auto" : "max-w-7xl mx-auto"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;