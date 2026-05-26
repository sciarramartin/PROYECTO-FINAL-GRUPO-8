import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MuroGrupo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  const renderAvatarChico = (foto, iniciales, extraClasses = "w-8 h-8 text-[11px]") => {
    if (!foto) {
      return (
        <div className={`${extraClasses} rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold shrink-0`}>
          {iniciales}
        </div>
      );
    }
    if (foto.length <= 4) {
      return (
        <div className={`${extraClasses} rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0`}>
          <span className="text-sm select-none">{foto}</span>
        </div>
      );
    }
    const src = foto.startsWith('data:') ? foto : `data:image/jpeg;base64,${foto}`;
    return (
      <img
        src={src}
        alt="Avatar"
        className={`${extraClasses} rounded-full object-cover shrink-0 border border-gray-200`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '';
          e.target.outerHTML = `<div class="${extraClasses} rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold shrink-0">${iniciales}</div>`;
        }}
      />
    );
  };
  
  const [grupo, setGrupo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [amigos, setAmigos] = useState([]);
  
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  
  // Estado para nuevo mensaje en el chat
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [uniendose, setUniendose] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  
  // Estado para añadir miembros
  const [procesandoId, setProcesandoId] = useState(null);

  // Estados para filtrar miembros y menú de 3 puntos
  const [filtroMiembros, setFiltroMiembros] = useState("");
  const [busquedaAmigos, setBusquedaAmigos] = useState("");
  const [menuAbiertoMiembroId, setMenuAbiertoMiembroId] = useState(null);
  const [posicionPopupY, setPosicionPopupY] = useState(0);
  const [miembroPopup, setMiembroPopup] = useState(null);

  // Estados para Modal de Configuración (solo Admin)
  const [modalConfiguracionAbierto, setModalConfiguracionAbierto] = useState(false);
  const [nombreConfig, setNombreConfig] = useState("");
  const [descripcionConfig, setDescripcionConfig] = useState("");
  const [estadoConfig, setEstadoConfig] = useState("publico");
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [errorConfig, setErrorConfig] = useState("");

  const abrirModalConfiguracion = () => {
    if (!grupo) return;
    setNombreConfig(grupo.nombre || "");
    setDescripcionConfig(grupo.descripcion || "");
    setEstadoConfig(grupo.estado || "publico");
    setErrorConfig("");
    setModalConfiguracionAbierto(true);
  };

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Obtener datos del usuario logueado desde sessionStorage
  const usuarioGuardado = sessionStorage.getItem("usuario");
  const usuarioLogueado = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const miUsuarioId = usuarioLogueado ? usuarioLogueado.id : null;

  const cargarDatosGrupo = async () => {
    setCargando(true);
    setError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const headers = { Authorization: `Bearer ${token}` };

      // Cargar detalles del grupo
      const grupoRes = await axios.get(`${apiUrl}/grupos/${id}`, { headers });
      setGrupo(grupoRes.data);

      // Si es miembro, cargar mensajes y lista de amigos en paralelo
      if (grupoRes.data.esMiembro) {
        const [mensajesRes, amigosRes] = await Promise.all([
          axios.get(`${apiUrl}/grupos/${id}/mensajes`, { headers }),
          axios.get(`${apiUrl}/amistades/lista`, { headers }).catch(err => {
            console.error("Error al cargar amigos:", err);
            return { data: [] };
          })
        ]);
        
        // WhatsApp style: ordenar los mensajes de más viejos a más nuevos (abajo del todo)
        // en el controlador vienen ORDER BY createdAt DESC, por lo que los invertimos
        setMensajes(mensajesRes.data.reverse());
        setAmigos(amigosRes.data);
      }
    } catch (err) {
      console.error("Error al cargar datos del grupo:", err);
      setError(err.response?.data?.error || "Error al acceder a este grupo de estudio.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarDatosGrupo();
    } else {
      navigate("/login");
    }
  }, [id]);

  // Auto-scroll al final del chat de WhatsApp sin afectar el scroll de la ventana principal de la app
  useEffect(() => {
    if (grupo?.esMiembro && mensajes.length > 0 && chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [mensajes, grupo?.esMiembro]);

  // Efecto: Unirse al socket de la sala del grupo y escuchar nuevos mensajes en tiempo real
  useEffect(() => {
    // Solo si el usuario es miembro y el socket global está conectado
    if (grupo?.esMiembro && window.socket) {
      // Unirse a la sala del grupo
      window.socket.emit("unirse_grupo", id);
      console.log(`[Socket.io] Solicitado ingreso a sala de chat grupo_${id}`);

      // Escuchar nuevos mensajes del grupo
      const manejarNuevoMensaje = (mensajeNuevo) => {
        console.log("[Socket.io] Nuevo mensaje recibido por WebSocket:", mensajeNuevo);
        setMensajes((prev) => {
          // Evitar duplicar si el remitente ya lo añadió de manera local
          if (prev.some((m) => m.id === mensajeNuevo.id)) return prev;
          return [...prev, mensajeNuevo];
        });
      };

      // Escuchar actualización de lista de miembros en tiempo real
      const manejarActualizacionMiembros = () => {
        console.log("[Socket.io] Recibida actualización de lista de miembros en tiempo real");
        cargarDatosGrupo();
      };

      window.socket.on("nuevo_mensaje_grupo", manejarNuevoMensaje);
      window.socket.on("miembros_actualizados", manejarActualizacionMiembros);

      return () => {
        // Limpiar escuchador y abandonar sala al salir
        window.socket.emit("salir_grupo", id);
        window.socket.off("nuevo_mensaje_grupo", manejarNuevoMensaje);
        window.socket.off("miembros_actualizados", manejarActualizacionMiembros);
        console.log(`[Socket.io] Conexiones y escuchas limpiadas para grupo_${id}`);
      };
    }
  }, [id, grupo?.esMiembro]);

  const publicarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    setPublicando(true);
    setError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.post(`${apiUrl}/grupos/${id}/mensajes`, {
        contenido: nuevoMensaje.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Añadir mensaje enviado de manera local instantánea (evitando duplicados)
      setMensajes((prev) => {
        if (prev.some((m) => m.id === response.data.id)) return prev;
        return [...prev, response.data];
      });
      setNuevoMensaje("");
    } catch (err) {
      console.error("Error al publicar mensaje:", err);
      setError(err.response?.data?.error || "Error al enviar el mensaje.");
    } finally {
      setPublicando(false);
    }
  };

  const cambiarRolMiembro = async (miembroId, nuevoRol) => {
    setMenuAbiertoMiembroId(null);
    setMiembroPopup(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.put(`${apiUrl}/grupos/${id}/miembros/${miembroId}/rol`, {
        rol: nuevoRol
      }, { headers });
      
      // Actualizar el estado local de forma reactiva e instantánea
      setGrupo((prev) => {
        if (!prev) return prev;
        const miembrosActualizados = prev.Miembros.map((m) => {
          if (m.id === miembroId) {
            return {
              ...m,
              GrupoMiembro: {
                ...m.GrupoMiembro,
                rol: nuevoRol
              }
            };
          }
          return m;
        });
        return { ...prev, Miembros: miembrosActualizados };
      });
      
      setMensajeExito(`Estudiante ${nuevoRol === 'admin' ? 'promovido a Administrador' : 'degradado a Miembro'} correctamente.`);
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (err) {
      console.error("Error al cambiar rol del miembro:", err);
      setError(err.response?.data?.error || "Error al modificar el rol del miembro.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const expulsarMiembro = async (miembroId, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre} de este grupo de estudio?`)) return;
    setMenuAbiertoMiembroId(null);
    setMiembroPopup(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${apiUrl}/grupos/${id}/miembros/${miembroId}`, { headers });
      
      // Actualizar el estado local de forma reactiva e instantánea
      setGrupo((prev) => {
        if (!prev) return prev;
        const miembrosActualizados = prev.Miembros.filter((m) => m.id !== miembroId);
        return { ...prev, Miembros: miembrosActualizados };
      });
      
      setMensajeExito(`Estudiante ${nombre} eliminado del grupo correctamente.`);
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (err) {
      console.error("Error al eliminar miembro:", err);
      setError(err.response?.data?.error || "Error al eliminar al miembro del grupo.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleGuardarConfiguracion = async (e) => {
    e.preventDefault();
    if (!nombreConfig.trim()) {
      setErrorConfig("El nombre del grupo es obligatorio.");
      return;
    }

    setGuardandoConfig(true);
    setErrorConfig("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.put(`${apiUrl}/grupos/${id}`, {
        nombre: nombreConfig.trim(),
        descripcion: descripcionConfig.trim(),
        estado: estadoConfig
      }, { headers });

      // Actualizar el estado local del grupo reactivamente
      setGrupo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          nombre: response.data.nombre,
          descripcion: response.data.descripcion,
          estado: response.data.estado
        };
      });

      setModalConfiguracionAbierto(false);
      setMensajeExito("¡Configuración del grupo actualizada correctamente!");
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (err) {
      console.error("Error al actualizar la configuración del grupo:", err);
      setErrorConfig(err.response?.data?.error || "Error al actualizar la configuración del grupo.");
    } finally {
      setGuardandoConfig(false);
    }
  };

  const unirseAlGrupo = async () => {
    setUniendose(true);
    setError("");
    setMensajeExito("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.post(`${apiUrl}/grupos/${id}/unirse`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensajeExito(response.data.mensaje || "¡Te has unido con éxito!");
      
      // Recargar datos para desbloquear el chat
      await cargarDatosGrupo();
    } catch (err) {
      console.error("Error al unirse al grupo:", err);
      setError(err.response?.data?.error || "No se pudo procesar la unión al grupo.");
    } finally {
      setUniendose(false);
    }
  };

  const salirDelGrupo = async () => {
    if (!window.confirm("¿Estás seguro de que quieres salir de este grupo de estudio?")) {
      return;
    }
    setSaliendo(true);
    setError("");
    setMensajeExito("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.post(`${apiUrl}/grupos/${id}/salir`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensajeExito(response.data.mensaje || "Has salido del grupo correctamente.");
      setTimeout(() => {
        navigate("/grupos");
      }, 1500);
    } catch (err) {
      console.error("Error al salir del grupo:", err);
      setError(err.response?.data?.error || "No se pudo procesar la salida del grupo.");
    } finally {
      setSaliendo(false);
    }
  };

  const agregarMiembro = async (idAmigo) => {
    setProcesandoId(idAmigo);
    setError("");
    setMensajeExito("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.post(`${apiUrl}/grupos/${id}/miembros`, {
        id_usuario_nuevo: idAmigo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensajeExito("¡Invitación enviada con éxito!");
      
      // Actualizar localmente la lista de pendientes
      if (grupo && response.data.miembro) {
        setGrupo({
          ...grupo,
          MiembrosPendientes: [...(grupo.MiembrosPendientes || []), response.data.miembro]
        });
      }
    } catch (err) {
      console.error("Error al agregar miembro:", err);
      setError(err.response?.data?.error || "Error al añadir al compañero al grupo.");
    } finally {
      setProcesandoId(null);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 font-medium">Cargando el grupo...</p>
      </div>
    );
  }

  if (error && !grupo) {
    return (
      <div className="max-w-2xl mx-auto mt-8 text-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <span className="text-4xl block mb-2">⚠️</span>
        <h2 className="text-base font-bold text-gray-900">Acceso denegado o error de carga</h2>
        <p className="text-xs text-gray-400 mt-1 mb-5">{error}</p>
        <button
          onClick={() => navigate("/grupos")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition duration-200 cursor-pointer border-none"
        >
          ← Volver a mis grupos
        </button>
      </div>
    );
  }

  const miembroIds = grupo ? grupo.Miembros.map(m => m.id) : [];
  const pendienteIds = grupo && grupo.MiembrosPendientes ? grupo.MiembrosPendientes.map(m => m.id) : [];

  const amigosNoMiembros = amigos.filter(amigo => {
    const yaMiembro = miembroIds.includes(amigo.id) || pendienteIds.includes(amigo.id);
    if (yaMiembro) return false;
    
    const nombreCompleto = `${amigo.nombre} ${amigo.apellido}`.toLowerCase();
    const usuario = amigo.nombre_usuario.toLowerCase();
    const query = busquedaAmigos.toLowerCase();
    return nombreCompleto.includes(query) || usuario.includes(query);
  });

  // Obtener rol del usuario logueado en este grupo
  const miMiembro = grupo?.Miembros?.find((m) => m.id === miUsuarioId);
  const miRol = miMiembro?.GrupoMiembro?.rol; // 'admin' o 'miembro'
  const soyAdmin = miRol === 'admin' || miRol === 'administrador';

  // Filtrar la lista de miembros por la lupita de búsqueda
  const miembrosFiltrados = grupo?.Miembros?.filter((miembro) => {
    const nombreCompleto = `${miembro.nombre} ${miembro.apellido}`.toLowerCase();
    const usuario = miembro.nombre_usuario.toLowerCase();
    const query = filtroMiembros.toLowerCase();
    return nombreCompleto.includes(query) || usuario.includes(query);
  }) || [];

  // Calcular la posición exacta del botón clicked relativo a la tarjeta card-miembros
  const abrirMenu = (e, miembro) => {
    const btnRect = e.currentTarget.getBoundingClientRect();
    const cardElement = document.getElementById("card-miembros");
    if (cardElement) {
      const cardRect = cardElement.getBoundingClientRect();
      const relativeY = btnRect.top - cardRect.top;
      setPosicionPopupY(relativeY - 14); 
      setMiembroPopup(miembro);
      setMenuAbiertoMiembroId(miembro.id);
    }
  };

  const inicialesGrupo = grupo ? grupo.nombre[0].toUpperCase() : "G";

  return (
    <div className="max-w-6xl mx-auto px-2">
      
      {/* Botón de Retorno */}
      <button
        onClick={() => navigate("/grupos")}
        className="mb-4 text-xs font-bold text-gray-500 hover:text-indigo-600 transition flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
      >
        ← Volver a Grupos de Estudio
      </button>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 rounded-xl px-4 py-3 text-xs mb-4 max-w-xl animate-fade-in flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
      {mensajeExito && (
        <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-xs mb-4 max-w-xl animate-fade-in flex items-center gap-2">
          <span>✓</span> {mensajeExito}
        </div>
      )}

      {/* --- RENDER 1: VISTA RESTRINGIDA (Si es público pero el usuario no es miembro) --- */}
      {grupo && !grupo.esMiembro ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Ficha descriptiva en la Izquierda */}
          <div className="lg:col-span-2 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-lg font-extrabold shrink-0">
                  {inicialesGrupo}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold text-gray-900 leading-snug truncate">{grupo.nombre}</h1>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full uppercase tracking-wider">
                      Público
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Organizador: {grupo.Creador ? `${grupo.Creador.nombre} ${grupo.Creador.apellido}` : "Estudiante"}
                  </p>
                </div>
              </div>

              {/* Botón de unión rápido en la cabecera (Máxima visibilidad) */}
              <button
                onClick={unirseAlGrupo}
                disabled={uniendose}
                style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                className="px-5 py-2.5 !bg-indigo-600 hover:!bg-indigo-700 !text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition duration-200 cursor-pointer border-none disabled:opacity-50 self-start sm:self-auto shrink-0"
              >
                {uniendose ? "Ingresando..." : "✓ Unirse al Grupo"}
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-700">Acerca de este grupo:</h3>
              <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-100 p-4 rounded-xl">
                {grupo.descripcion || "Este grupo de estudio no posee una descripción cargada aún."}
              </p>
            </div>

            {/* Vista Previa de Roster */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-700">Miembros actuales ({grupo.Miembros.length}):</h3>
              <div className="flex flex-wrap gap-2">
                {grupo.Miembros.map((miembro) => {
                  const iniciales = `${miembro.nombre[0]}${miembro.apellido[0]}`.toUpperCase();
                  const foto = miembro.Perfil?.foto_perfil || miembro.perfil?.foto_perfil;
                  return (
                    <div 
                      key={miembro.id}
                      title={`${miembro.nombre} ${miembro.apellido} (@${miembro.nombre_usuario})`}
                      className="shrink-0"
                    >
                      {renderAvatarChico(foto, iniciales, "w-8 h-8 text-[10px]")}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panel Flotante a la Derecha para unirse */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm text-center space-y-4">
            <span className="text-4xl block">🌍</span>
            <h2 className="text-sm font-bold text-gray-900">¡Sumate al equipo!</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Este es un grupo público. Unite ahora para poder leer los mensajes del muro, conversar con tus compañeros y compartir ideas de estudio.
            </p>
            
            <button
              onClick={unirseAlGrupo}
              disabled={uniendose}
              style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
              className="w-full py-3 !bg-indigo-600 hover:!bg-indigo-700 !text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition duration-200 cursor-pointer border-none disabled:opacity-50"
            >
              {uniendose ? "Ingresando..." : "✓ Unirse al Grupo"}
            </button>
            <div className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
              🔒 El chat y los mensajes se mantendrán ocultos hasta que seas miembro.
            </div>
          </div>
        </div>
      ) : (

        /* --- RENDER 2: VISTA DESBLOQUEADA CON CHAT ESTILO WHATSAPP (Miembros) --- */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Panel Izquierdo (3/4 de ancho): Chat de WhatsApp */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden flex flex-col justify-between">
            
            {/* WhatsApp Header (Barra Superior del Chat) */}
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-indigo-150 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-extrabold shrink-0">
                  {inicialesGrupo}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-extrabold text-gray-850 truncate">{grupo?.nombre}</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                    {grupo?.Miembros?.length || 0} miembros • {grupo?.estado === 'publico' ? 'Grupo Público' : 'Grupo Privado'}
                  </p>
                </div>
              </div>

              {soyAdmin && (
                <button
                  onClick={abrirModalConfiguracion}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-indigo-650 transition cursor-pointer border-none bg-transparent flex items-center justify-center"
                  title="Configurar Grupo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* WhatsApp Scroll Area (Middle Messages Feed) */}
            <div 
              ref={chatContainerRef}
              className="h-[460px] overflow-y-auto p-4 space-y-3 bg-[#efeae2] relative"
              style={{
                backgroundImage: "radial-gradient(#dfdcd6 1px, transparent 1px)",
                backgroundSize: "16px 16px"
              }}
            >
              {mensajes.length > 0 ? (
                mensajes.map((msg) => {
                  const autor = msg.Autor;
                  const esPropio = msg.id_usuario === miUsuarioId;
                  const nombreAutor = autor ? `${autor.nombre} ${autor.apellido}` : "Compañero";
                  
                  // Formatear hora estilo WhatsApp (12:45)
                  const fechaObjeto = new Date(msg.createdAt);
                  const horaWhatsApp = fechaObjeto.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${esPropio ? 'justify-end' : 'justify-start'} items-start w-full gap-2 animate-fade-in`}
                    >
                      {/* Avatar del autor para mensajes ajenos */}
                      {!esPropio && (
                        <div className="mt-0.5 shrink-0" title={nombreAutor}>
                          {renderAvatarChico(
                            autor?.Perfil?.foto_perfil || autor?.perfil?.foto_perfil, 
                            `${autor?.nombre?.[0] || 'U'}${autor?.apellido?.[0] || 'S'}`.toUpperCase(),
                            "w-7 h-7 text-[9px]"
                          )}
                        </div>
                      )}
                      
                      <div 
                        className={`max-w-md px-3 py-1.5 text-xs shadow-sm rounded-2xl ${
                          esPropio 
                            ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none border border-[#d1f8cb]' 
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-150'
                        }`}
                      >
                        {/* Autor de mensaje (Solo para recibidos) */}
                        {!esPropio && (
                          <span className="text-[9.5px] font-extrabold text-indigo-600 mb-0.5 block truncate">
                            {nombreAutor}
                          </span>
                        )}
                        
                        {/* Contenido del Mensaje */}
                        <p className="whitespace-pre-wrap leading-relaxed break-words text-gray-800">
                          {msg.contenido}
                        </p>

                        {/* Hora al pie derecho */}
                        <span className="text-[8.5px] text-gray-400 block text-right mt-1 font-sans">
                          {horaWhatsApp}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty Chat */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
                  <span className="text-4xl block mb-2 opacity-50">💬</span>
                  <h4 className="text-xs font-bold text-gray-600">Comienzo del chat de grupo</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 max-w-[240px]">¡Saludá al equipo y coordiná horarios de estudio para materias!</p>
                </div>
              )}

            </div>

            {/* WhatsApp Send Dock (Barra de Entrada) */}
            <form onSubmit={publicarMensaje} className="bg-[#f0f2f5] border-t border-gray-200 px-4 py-3 flex items-center gap-3">
              <input
                type="text"
                placeholder="Escribe un mensaje aquí..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                maxLength={400}
                required
                className="flex-1 bg-white border border-gray-250 rounded-full px-4 py-2 text-xs outline-none text-gray-700 placeholder-gray-450 focus:ring-1 focus:ring-indigo-400 transition"
              />
              <button
                type="submit"
                disabled={publicando || !nuevoMensaje.trim()}
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-sm border-none transition"
              >
                {publicando ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="text-sm">➔</span>
                )}
              </button>
            </form>

          </div>

          {/* Panel Derecho (1/4 de ancho): Roster y Miembros */}
          <div className="space-y-6">
            {/* Lista Completa de Miembros */}
            <div id="card-miembros" className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4 relative">
              <h2 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2.5 flex items-center justify-between">
                <span>Miembros ({grupo?.Miembros?.length || 0})</span>
              </h2>

              {/* Buscador de Miembros */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={filtroMiembros}
                  onChange={(e) => setFiltroMiembros(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-400 rounded-xl text-[10.5px] text-gray-800 placeholder-gray-455 outline-none transition duration-200"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px] select-none pointer-events-none">🔍</span>
                {filtroMiembros && (
                  <button 
                    type="button"
                    onClick={() => setFiltroMiembros("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px]"
                  >
                    ❌
                  </button>
                )}
              </div>

              {/* Lista Completa de Miembros */}
              <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                {miembrosFiltrados.length > 0 ? (
                  miembrosFiltrados.map((miembro) => {
                    const iniciales = `${miembro.nombre[0] || 'U'}${miembro.apellido[0] || 'S'}`.toUpperCase();
                    const rolOriginal = miembro.GrupoMiembro?.rol;
                    const esAdmin = rolOriginal === "administrador" || rolOriginal === "admin";
                    const rolTexto = esAdmin ? "Admin" : "Miembro";
                    
                    return (
                      <div key={miembro.id} className="flex items-center justify-between gap-2 relative min-h-[38px]">
                        <div className="flex items-center gap-2 min-w-0">
                          {renderAvatarChico(
                            miembro.Perfil?.foto_perfil || miembro.perfil?.foto_perfil,
                            iniciales,
                            "w-8 h-8 text-[10px]"
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-gray-800 truncate">
                              {miembro.nombre} {miembro.apellido} {miembro.id === miUsuarioId && <span className="text-[9px] text-indigo-500 font-normal">(Tú)</span>}
                            </p>
                            <p className="text-[9px] text-gray-400 truncate">@{miembro.nombre_usuario}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[8.5px] font-bold py-0.5 rounded-full w-16 text-center justify-center flex shrink-0 ${
                            esAdmin ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {rolTexto}
                          </span>

                          {/* Menú de 3 Puntos: Solo visible si soy Admin y no es mi propia fila */}
                          {soyAdmin && miembro.id !== miUsuarioId && (
                            <button
                              type="button"
                              onClick={(e) => abrirMenu(e, miembro)}
                              className={`w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-150 transition duration-150 cursor-pointer border-none bg-transparent ${
                                menuAbiertoMiembroId === miembro.id ? 'text-indigo-650 font-bold bg-gray-100' : 'text-gray-450 hover:text-gray-755'
                              }`}
                            >
                              ⋮
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-gray-400 text-center py-4">No se encontraron miembros.</p>
                )}
              </div>

              {/* Botón Salir del Grupo */}
              <button
                onClick={salirDelGrupo}
                disabled={saliendo}
                style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                className="w-full mt-4 py-2 !bg-red-100 hover:!bg-red-200 border border-red-200 hover:border-red-300 !text-red-700 hover:!text-red-800 rounded-xl text-xs font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                🚪 {saliendo ? "Saliendo..." : "Salir del Grupo"}
              </button>

              {/* Popover Absoluto Flotante (Fuera del Scroll, Dentro de la Tarjeta Relativa) */}
              {menuAbiertoMiembroId && miembroPopup && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => {
                      setMenuAbiertoMiembroId(null);
                      setMiembroPopup(null);
                    }}
                  />
                  <div 
                    className="absolute z-50 bg-white border border-gray-150 rounded-2xl shadow-xl p-3.5 w-40 md:w-44 animate-fade-in origin-right right-4 md:right-[105%]"
                    style={{
                      top: `${posicionPopupY}px`,
                    }}
                  >
                    {/* Arrow indicator pointing to the clicked row */}
                    <div className="hidden md:block absolute top-3.5 -right-[5.5px] w-2.5 h-2.5 bg-white border-r border-t border-gray-150 rotate-45 z-50"></div>
                    
                    <div className="min-w-0">
                      <p className="text-[8.5px] font-extrabold text-indigo-750 uppercase tracking-wider select-none">Gestionar</p>
                      <p className="text-[10px] font-bold text-gray-800 truncate mt-0.5">{miembroPopup.nombre} {miembroPopup.apellido}</p>
                      <p className="text-[8.5px] text-gray-450 truncate">@{miembroPopup.nombre_usuario}</p>
                    </div>
                    
                    <div className="h-px bg-gray-100 my-2" />
                    
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const isCurrentlyAdmin = miembroPopup.GrupoMiembro?.rol === "administrador" || miembroPopup.GrupoMiembro?.rol === "admin";
                          cambiarRolMiembro(miembroPopup.id, isCurrentlyAdmin ? "miembro" : "admin");
                        }}
                        className="w-full text-left px-3 py-2 text-[10px] text-indigo-700 bg-indigo-50/40 hover:bg-indigo-600 hover:text-white border border-indigo-150 hover:border-indigo-600 rounded-xl font-extrabold transition-all duration-200 flex items-center justify-between gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>🛡️ {miembroPopup.GrupoMiembro?.rol === "administrador" || miembroPopup.GrupoMiembro?.rol === "admin" ? "Quitar Admin" : "Hacer Admin"}</span>
                        <span className="text-[9px] opacity-75 font-normal">→</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => expulsarMiembro(miembroPopup.id, `${miembroPopup.nombre} ${miembroPopup.apellido}`)}
                        className="w-full text-left px-3 py-2 text-[10px] text-red-600 bg-red-50/40 hover:bg-red-600 hover:text-white border border-red-150 hover:border-red-600 rounded-xl font-extrabold transition-all duration-200 flex items-center justify-between gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>❌ Eliminar</span>
                        <span className="text-[9px] opacity-75 font-normal">→</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Invitar Amigos (Sincronizado) */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-2.5">
                <h2 className="text-xs font-bold text-gray-900">Invitar Amigos</h2>
                <p className="text-[9px] text-gray-400 mt-0.5">Suma a tus amigos a este grupo de estudio.</p>
              </div>

              {/* Lupita de búsqueda de amigos */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Buscar amigos por nombre..."
                  value={busquedaAmigos}
                  onChange={(e) => setBusquedaAmigos(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-[10px] text-gray-850 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
                {busquedaAmigos && (
                  <button
                    onClick={() => setBusquedaAmigos("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-450 hover:text-gray-650 transition cursor-pointer border-none bg-transparent text-[10px]"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {amigosNoMiembros.length > 0 ? (
                  amigosNoMiembros.map((amigo) => {
                    const iniciales = `${amigo.nombre[0]}${amigo.apellido[0]}`.toUpperCase();
                    return (
                      <div key={amigo.id} className="flex items-center justify-between gap-2 p-2 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                          {renderAvatarChico(
                            amigo.Perfil?.foto_perfil || amigo.perfil?.foto_perfil,
                            iniciales,
                            "w-8 h-8 text-[10px]"
                          )}
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-805 truncate">{amigo.nombre} {amigo.apellido}</p>
                            <p className="text-[8.5px] text-gray-450 truncate">@{amigo.nombre_usuario}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => agregarMiembro(amigo.id)}
                          disabled={procesandoId === amigo.id}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold transition shrink-0 disabled:opacity-50 cursor-pointer border-none"
                        >
                          {procesandoId === amigo.id ? "..." : "+ Añadir"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  /* Empty friends roster */
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-250">
                    <span className="text-2xl block mb-1">👋</span>
                    <h4 className="text-[10px] font-bold text-gray-700">Sin amigos para invitar</h4>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Modal de Configuración (Solo Administradores) */}
      {modalConfiguracionAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            {/* Cabecera */}
            <div className="bg-gray-50 border-b border-gray-150 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">⚙️</span>
                <h3 className="text-xs font-bold text-gray-800">Configuración del Grupo</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalConfiguracionAbierto(false)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer border-none bg-transparent text-sm font-bold animate-pulse"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarConfiguracion} className="p-5 space-y-4">
              {errorConfig && (
                <div className="bg-red-50 border border-red-200 text-red-500 rounded-xl px-4 py-2.5 text-[10px] animate-fade-in flex items-center gap-2">
                  <span>⚠️</span> {errorConfig}
                </div>
              )}

              {/* Nombre */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-700">Nombre del Grupo</label>
                <input
                  type="text"
                  value={nombreConfig}
                  onChange={(e) => setNombreConfig(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  placeholder="Ej: Grupo de Álgebra I"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-700">Descripción</label>
                <textarea
                  value={descripcionConfig}
                  onChange={(e) => setDescripcionConfig(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition resize-none"
                  placeholder="Describí los temas o metas del grupo..."
                />
              </div>

              {/* Visibilidad (Estado) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Privacidad / Visibilidad</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Opción Público */}
                  <label
                    className={`flex flex-col p-3 border rounded-xl cursor-pointer transition select-none ${
                      estadoConfig === "publico"
                        ? "border-indigo-500 bg-indigo-50/30 text-indigo-750"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-650"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="estadoConfig"
                        value="publico"
                        checked={estadoConfig === "publico"}
                        onChange={() => setEstadoConfig("publico")}
                        className="hidden"
                      />
                      <span className="text-xs">🌐</span>
                      <span className="text-[10px] font-bold">Público</span>
                    </div>
                    <span className="text-[8.5px] text-gray-400 mt-1 leading-tight">
                      Cualquier estudiante puede buscarlo e ingresar.
                    </span>
                  </label>

                  {/* Opción Privado */}
                  <label
                    className={`flex flex-col p-3 border rounded-xl cursor-pointer transition select-none ${
                      estadoConfig === "privado"
                        ? "border-indigo-500 bg-indigo-50/30 text-indigo-750"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-650"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="estadoConfig"
                        value="privado"
                        checked={estadoConfig === "privado"}
                        onChange={() => setEstadoConfig("privado")}
                        className="hidden"
                      />
                      <span className="text-xs">🔒</span>
                      <span className="text-[10px] font-bold">Privado</span>
                    </div>
                    <span className="text-[8.5px] text-gray-400 mt-1 leading-tight">
                      Solo personas invitadas pueden verlo y unirse.
                    </span>
                  </label>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalConfiguracionAbierto(false)}
                  className="flex-1 text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-650 text-xs font-bold rounded-xl transition border-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoConfig}
                  className="flex-1 text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition border-none cursor-pointer disabled:opacity-50"
                >
                  {guardandoConfig ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuroGrupo;
