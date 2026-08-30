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
  FiCpu
} from "react-icons/fi";

const menuItems = [
  { label: "Dashboard", icon: <FiGrid />, path: "/dashboard" },
  { label: "Asistente IA", icon: <FiCpu />, path: "/asistente-ia" },
  { label: "Planificador", icon: <FiCompass />, path: "/planificador" },
  { label: "Materias", icon: <FiBookOpen />, path: "/materias" },
  { label: "Calendario", icon: <FiCalendar />, path: "/calendario" },
  { label: "Horario", icon: <FiClock />, path: "/Horario" },
  { label: "Conexiones", icon: <FiShare2 />, path: "/conexiones" },
  { label: "Grupos", icon: <FiUsers />, path: "/grupos" },
  { label: "Foros", icon: <FiMessageSquare />, path: "/foros" },
  { label: "Repositorio", icon: <FiGitMerge />, path: "/repositorio" },
  { label: "Reportes", icon: <FiBarChart2 />, path: "/reportes", role: 3 },
  { label: "Mapa Correlativas", icon: <FiGitMerge />, path: "/mapa-correlatividades", role: 1 },
  { label: "Registrar Correlativas", icon: <FiPlusCircle />, path: "/correlativas", role: 3 }
];

const Layout = ({ children }) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(() => {
    const guardado = localStorage.getItem("theme");
    if (guardado) return guardado === "dark";
    return false; // Modo claro (blanco) por defecto
  });

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
  const [fotoPerfil, setFotoPerfil] = useState("");

  // Estados para Mensajes de Grupos no leídos
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

  // Efecto para sincronizar el tema con la clase del documentElement
  useEffect(() => {
    if (temaOscuro) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [temaOscuro]);

  const toggleTema = () => {
    setTemaOscuro(!temaOscuro);
  };

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
  // Cargar Mensajes de Grupos no leídos
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

        // Si el último mensaje es mío, no lo considero pendiente
        const esMio = Number(ultMsg.id_usuario) === Number(userId);
        if (esMio) return false;

        // Si estamos viendo el muro de este grupo actualmente, tampoco es pendiente
        const pathParts = window.location.pathname.split("/");
        const esMuroGrupo = pathParts[1] === "grupos" && pathParts[2] !== undefined && Number(pathParts[2]) === Number(grupo.id);
        if (esMuroGrupo) {
          // Actualizar localStorage para que ya no aparezca como unread
          ultimosVistos[grupo.id] = ultMsg.id;
          localStorage.setItem(`grupo_ultimo_visto_${userId}`, JSON.stringify(ultimosVistos));
          return false;
        }

        let ultimoVistoId = ultimosVistos[grupo.id] || 0;
        if (Number(ultimoVistoId) > Number(ultMsg.id)) {
          ultimoVistoId = 0;
          ultimosVistos[grupo.id] = 0;
          localStorage.setItem(`grupo_ultimo_visto_${userId}`, JSON.stringify(ultimosVistos));
        }

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

  // Sincronizar notificaciones de chat al cambiar de ruta
  useEffect(() => {
    cargarMensajesPendientes();
    cargarGruposMensajesPendientes();
    cargarFotoPerfilPropia();
  }, [location.pathname]);

  // Escuchar el evento personalizado de lectura de grupo
  useEffect(() => {
    const handleGrupoLeido = () => {
      cargarGruposMensajesPendientes();
    };
    window.addEventListener("grupo_leido", handleGrupoLeido);
    return () => {
      window.removeEventListener("grupo_leido", handleGrupoLeido);
    };
  }, [usuario?.id]);

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
  const tokenVal = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (tokenVal && usuario?.id && !window.socket) {
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

      window.socket.on("actualizar_amistad", () => {
        console.log("[Socket.io] Recibida notificación de actualización de amistad");
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

      window.socket.on("nuevo_mensaje_grupo_notificacion", (data) => {
        console.log("[Socket.io Debug] Recibida notificación de nuevo mensaje de grupo en tiempo real:", data);
        // Solo notificar si no estamos viendo este grupo actualmente
        const pathParts = window.location.pathname.split("/");
        const esMuroDeEsteGrupo = pathParts[1] === "grupos" && pathParts[2] !== undefined && Number(pathParts[2]) === Number(data.id_grupo);
        console.log(`[Socket.io Debug] ¿Es muro de este grupo? ${esMuroDeEsteGrupo}. pathParts[2]: ${pathParts[2]}, data.id_grupo: ${data.id_grupo}`);
        if (!esMuroDeEsteGrupo) {
          console.log("[Socket.io Debug] No es el muro del grupo actual, cargando mensajes pendientes de grupos...");
          cargarGruposMensajesPendientes();
        }
      });

      return () => {
        if (window.socket) {
          window.socket.off("connect");
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
      console.log("[Socket.io] Conexión cerrada por logout");
    }
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col font-sans transition-colors duration-300">

      {/* HEADER TRANSPARENTE CON BLUR */}
      <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-4 md:px-6 fixed top-0 left-0 right-0 z-30 transition-colors duration-300">

        {/* Izquierda: Hamburguesa + Marca */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            aria-label="Abrir menú"
          >
            {sidebarAbierto ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <span className="text-xl font-bold">🎓</span>
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-none">Campus</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">Planificá tu cursada</p>
            </div>
          </div>
        </div>

        {/* BUSCADOR GLOBAL (LUPITA) RESPONSIVE */}
        <div className="flex-1 max-w-xs md:max-w-md mx-4 md:mx-12 relative">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
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
              className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-500 outline-none transition text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500"
            />
            {busqueda && (
              <button
                onClick={() => { setBusqueda(""); setResultados([]); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-205"
              >
                ✕
              </button>
            )}
          </div>

          {/* Panel Flotante de Sugerencias */}
          {mostrarSugerencias && (busqueda.trim() || cargandoBusqueda) && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {cargandoBusqueda ? (
                <div className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2">
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
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 flex items-center gap-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-b-0 transition"
                    >
                      {renderAvatarChico(user.Perfil?.foto_perfil || user.perfil?.foto_perfil, `${user.nombre[0]}${user.apellido[0]}`.toUpperCase())}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-tight truncate">
                          {user.nombre} {user.apellido}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-none truncate mt-0.5">
                          @{user.nombre_usuario}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No se encontraron compañeros.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Derecha: Acciones de usuario, campana y tema */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Botón de Tema (Claro/Oscuro) */}
          <button
            onClick={toggleTema}
            className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition duration-200"
            title={temaOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {temaOscuro ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          {/* Campana de Notificaciones con Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMostrarCampanitaDropdown(!mostrarCampanitaDropdown)}
              className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition duration-200"
            >
              <FiBell className="w-5 h-5" />
              {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes + cantGruposMensajesPendientes > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold">
                  {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes + cantGruposMensajesPendientes}
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
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 py-3.5 px-4">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center justify-between">
                    <span>Notificaciones</span>
                    {(cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes + cantGruposMensajesPendientes > 0) && (
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                        {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes + cantGruposMensajesPendientes} pendientes
                      </span>
                    )}
                  </h3>

                  {/* Solicitudes de Amistad */}
                  {cantPendientes > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Solicitudes de amistad ({cantPendientes})</p>
                      <div className="mt-2 space-y-2 max-h-36 overflow-y-auto">
                        {solicitudesAmistadPendientes.map((sol) => {
                          const amigo = sol.usuario || sol.UsuarioOrigen || sol.UsuarioDestino || {};
                          const inicialesAmigo = `${amigo.nombre?.[0] || ""}${amigo.apellido?.[0] || ""}`.toUpperCase();
                          return (
                            <div key={sol.id_solicitud || sol.id} className="flex flex-col gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                              <div className="flex items-center gap-2 min-w-0">
                                {renderAvatarChico(amigo.Perfil?.foto_perfil || amigo.perfil?.foto_perfil, inicialesAmigo, "w-8 h-8 text-xs")}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{amigo.nombre} {amigo.apellido}</p>
                                  <p className="text-[10px] text-zinc-400 truncate">@{amigo.nombre_usuario}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <button
                                  onClick={() => aceptarSolicitudAmistad(amigo.id)}
                                  className="flex-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[9px] font-bold cursor-pointer border-none transition"
                                >
                                  Aceptar
                                </button>
                                <button
                                  onClick={() => rechazarSolicitudAmistad(amigo.id)}
                                  className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-bold cursor-pointer border-none transition"
                                >
                                  Rechazar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Invitaciones a Grupos */}
                  {cantInvitacionesPendientes > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Grupos de estudio ({cantInvitacionesPendientes})</p>
                      <div className="mt-2 space-y-2 max-h-36 overflow-y-auto">
                        {invitacionesPendientes.map((inv) => {
                          const grupoInv = inv.Grupo || {};
                          const inicialesGrupo = grupoInv.nombre?.[0]?.toUpperCase() || "G";
                          return (
                            <div key={inv.id} className="flex flex-col gap-1.5 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded uppercase tracking-wider">
                                  Grupo de Estudio
                                </span>
                                <span className="text-[9px] text-zinc-400">
                                  Por @{grupoInv.Creador?.nombre_usuario || "creador"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5 min-w-0 mt-0.5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[12px] font-extrabold shrink-0 shadow-sm">
                                  {inicialesGrupo}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{grupoInv.nombre}</p>
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate leading-none mt-0.5">
                                    Te invitaron a formar parte de este grupo
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => aceptarInvitacionGrupo(grupoInv.id)}
                                  className="flex-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[9px] font-bold cursor-pointer border-none transition shadow-sm"
                                >
                                  Aceptar
                                </button>
                                <button
                                  onClick={() => rejectInvitacionGrupo(grupoInv.id)}
                                  className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-bold cursor-pointer border-none transition shadow-sm"
                                >
                                  Rechazar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mensajes Privados Agrupados */}
                  {(() => {
                    const mensajesAgrupados = [];
                    const mapaMensajes = new Map();
                    (mensajesPendientes || []).forEach((msg) => {
                      const remitenteId = msg.Remitente?.id;
                      if (!remitenteId) return;
                      if (!mapaMensajes.has(remitenteId)) {
                        mapaMensajes.set(remitenteId, {
                          remitente: msg.Remitente,
                          cantidad: 0
                        });
                      }
                      mapaMensajes.get(remitenteId).cantidad += 1;
                    });
                    mapaMensajes.forEach((val) => mensajesAgrupados.push(val));

                    if (mensajesAgrupados.length === 0) return null;

                    return (
                      <div className="mt-3">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mensajes no leídos ({cantMensajesPendientes})</p>
                        <div className="mt-2 space-y-2 max-h-36 overflow-y-auto">
                          {mensajesAgrupados.map((item) => {
                            const remitente = item.remitente || {};
                            const inicialesRemi = `${remitente.nombre?.[0] || ""}${remitente.apellido?.[0] || ""}`.toUpperCase();
                            return (
                              <div key={remitente.id} className="flex items-center justify-between gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                <div className="flex items-center gap-2 min-w-0">
                                  {renderAvatarChico(remitente.Perfil?.foto_perfil || remitente.perfil?.foto_perfil, inicialesRemi, "w-8 h-8 text-xs")}
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{remitente.nombre} {remitente.apellido}</p>
                                    <p className="text-[10px] text-zinc-400 truncate leading-none mt-0.5">
                                      {item.cantidad} {item.cantidad === 1 ? "mensaje nuevo" : "mensajes nuevos"}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    navigate(`/chat-privado/${remitente.id}`);
                                    setMostrarCampanitaDropdown(false);
                                  }}
                                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold cursor-pointer border-none transition"
                                >
                                  Ver
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Mensajes de Grupos no leídos */}
                  {cantGruposMensajesPendientes > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mensajes de grupos ({cantGruposMensajesPendientes})</p>
                      <div className="mt-2 space-y-2 max-h-36 overflow-y-auto">
                        {gruposMensajesPendientes.map((grupo) => {
                          const inicialesGrupo = grupo.nombre?.[0]?.toUpperCase() || "G";
                          return (
                            <div key={grupo.id} className="flex flex-col gap-1.5 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-150/50 dark:border-zinc-800/30">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 rounded uppercase tracking-wider">
                                  Mensaje de Grupo
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3 mt-0.5 min-w-0">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 shadow-sm">
                                    {inicialesGrupo}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{grupo.nombre}</p>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate leading-none mt-0.5">
                                      Nuevo mensaje en el grupo
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    navigate(`/grupos/${grupo.id}`);
                                    setMostrarCampanitaDropdown(false);
                                  }}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer border-none transition shrink-0 shadow-sm"
                                >
                                  Ver
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {cantPendientes + cantInvitacionesPendientes + cantMensajesPendientes + cantGruposMensajesPendientes === 0 && (
                    <div className="py-6 text-center text-xs text-zinc-400">
                      No tienes notificaciones pendientes.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Menú de Usuario */}
          <div className="relative">
            <button
              onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
              className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl p-1.5 transition duration-200"
            >
              {renderAvatarChico(fotoPerfil, iniciales)}
              <div className="hidden md:block text-left select-none max-w-[120px]">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-tight truncate">{usuario?.nombre || "Usuario"}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate mt-0.5">{usuario?.id_tipo_usuario === 3 ? "Administrador" : "Estudiante"}</p>
              </div>
              <FiChevronDown className={`text-zinc-400 w-3 h-3 transition-transform duration-200 ${menuUsuarioAbierto ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown del Menú de Usuario */}
            {menuUsuarioAbierto && (
              <>
                {/* Backdrop invisible para cerrar el menú haciendo clic fuera */}
                <div className="fixed inset-0 z-40" onClick={() => setMenuUsuarioAbierto(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 md:hidden">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{usuario?.nombre || "Usuario"}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{usuario?.id_tipo_usuario === 3 ? "Administrador" : "Estudiante"}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMenuUsuarioAbierto(false);
                      navigate("/mi-perfil");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2.5 font-medium transition"
                  >
                    👤 Mi Perfil
                  </button>
                  <button
                    onClick={() => {
                      setMenuUsuarioAbierto(false);
                      navigate("/mis-guardados");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2.5 font-medium transition"
                  >
                    💾 Mis Guardados
                  </button>
                  <button
                    onClick={() => { cerrarSesion(); setMenuUsuarioAbierto(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2.5 font-medium transition"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">

        {/* OVERLAY oscuro en versión móvil */}
        {sidebarAbierto && (
          <div
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setSidebarAbierto(false)}
          />
        )}

        {/* SIDEBAR LATERAL */}
        <aside className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80
          flex flex-col justify-between z-20 transition-all duration-300
          ${sidebarAbierto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}>
          <nav className="p-3.5 flex flex-col gap-1.5 mt-2 overflow-y-auto max-h-[calc(100% - 4.5rem)]">
            {menuItems.filter(item => !item.role || item.role === usuario?.id_tipo_usuario).map((item) => {
              const activo = location.pathname === item.path;
              const esConexiones = item.path === "/conexiones";
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarAbierto(false); }}
                  className={`
                    flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left relative group
                    ${activo
                      ? "bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }
                  `}
                >
                  {/* Borde activo en el extremo izquierdo */}
                  {activo && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-indigo-500 dark:bg-indigo-400" />
                  )}
                  <div className="flex items-center gap-3">
                    <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${activo ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>

                  {/* GLOBITO DE SOLICITUDES PENDIENTES */}
                  {esConexiones && cantPendientes + cantMensajesPendientes > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {cantPendientes + cantMensajesPendientes}
                    </span>
                  )}

                  {/* GLOBITO DE GRUPOS (MENSAJES E INVITACIONES PENDIENTES) */}
                  {item.path === "/grupos" && cantGruposMensajesPendientes + cantInvitacionesPendientes > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {cantGruposMensajesPendientes + cantInvitacionesPendientes}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Botón inferior: Cerrar Sesión */}
          <div className="p-3.5 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 w-full text-left"
            >
              <FiLogOut className="text-lg" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* CONTENEDOR DE CONTENIDO PRINCIPAL */}
        <main className="flex-1 md:ml-60 p-4 md:p-8 min-h-full bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>



    </div>
  );
};

export default Layout;