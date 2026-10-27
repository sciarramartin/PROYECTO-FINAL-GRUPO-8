import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Helper de nombres de carreras
const CARRERAS = {
  1: "Ingeniería en Sistemas",
  2: "Ingeniería Electrónica",
  3: "Ingeniería Industrial",
  4: "Ingeniería Mecánica",
  5: "Ingeniería Civil",
  6: "Ingeniería Química",
  7: "Ingeniería Eléctrica",
  8: "Ingeniería Metalúrgica"
};

const MisConexiones = () => {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState("amigos"); // amigos, solicitudes

  const renderAvatar = (foto, iniciales, sizeClass = "w-12 h-12 text-sm") => {
    if (!foto) {
      return (
        <div className={`${sizeClass} rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-150 dark:border-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0 transition-colors duration-200`}>
          {iniciales}
        </div>
      );
    }
    if (foto.length <= 4) {
      return (
        <div className={`${sizeClass} rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-150 dark:border-indigo-900/50 flex items-center justify-center shrink-0 text-2xl transition-colors duration-200`}>
          {foto}
        </div>
      );
    }
    return (
      <img
        src={foto}
        alt="Avatar"
        className={`${sizeClass} rounded-full object-cover border border-gray-200 dark:border-slate-700 shrink-0 transition-colors duration-200`}
      />
    );
  };
  
  const [amigos, setAmigos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [mensajesPendientes, setMensajesPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      
      // Consultas en paralelo para optimizar tiempos de carga
      const [amigosRes, solicitudesRes, notifRes] = await Promise.all([
        axios.get(`${apiUrl}/amistades/lista`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/amistades/pendientes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/chat-privado/notificaciones/pendientes`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setAmigos(amigosRes.data);
      setSolicitudes(solicitudesRes.data);
      setMensajesPendientes(notifRes.data);
    } catch (err) {
      console.error("Error al cargar conexiones:", err);
      setError("Ocurrió un error al obtener tus conexiones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    if (window.socket) {
      const handleSocketUpdate = () => {
        console.log("[Socket.io] Conexiones actualizadas por evento en tiempo real");
        cargarDatos();
      };

      window.socket.on("nueva_solicitud_amistad", handleSocketUpdate);
      window.socket.on("actualizar_amistad", handleSocketUpdate);
      window.socket.on("mensaje_privado", handleSocketUpdate);
      window.socket.on("mensajes_leidos", handleSocketUpdate);

      return () => {
        window.socket.off("nueva_solicitud_amistad", handleSocketUpdate);
        window.socket.off("actualizar_amistad", handleSocketUpdate);
        window.socket.off("mensaje_privado", handleSocketUpdate);
        window.socket.off("mensajes_leidos", handleSocketUpdate);
      };
    }
  }, []);

  const aceptarSolicitud = async (idOrigen) => {
    setProcesandoId(idOrigen);
    setError("");
    setMensaje("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.put(`${apiUrl}/amistades/aceptar`, 
        { id_usuario_origen: idOrigen }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje(response.data.mensaje || "Solicitud aceptada");
      await cargarDatos(); // Recargar listas
    } catch (err) {
      console.error("Error al aceptar solicitud:", err);
      setError(err.response?.data?.error || "Error al aceptar la solicitud.");
    } finally {
      setProcesandoId(null);
    }
  };

  const rechazarOEliminar = async (idOtro, confirmRequired = false) => {
    if (confirmRequired && !window.confirm("¿Seguro que deseas eliminar esta conexión de amigos?")) {
      return;
    }
    
    setProcesandoId(idOtro);
    setError("");
    setMensaje("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.delete(`${apiUrl}/amistades/eliminar`, {
        data: { id_usuario_b: idOtro },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje(response.data.mensaje || "Relación cancelada");
      await cargarDatos();
    } catch (err) {
      console.error("Error al rechazar/eliminar:", err);
      setError(err.response?.data?.error || "Error al procesar la baja de la relación.");
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-2">
      
      {/* Título de Sección */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-tight transition-colors duration-200">Mis Conexiones</h1>
          <p className="text-sm text-gray-400 dark:text-slate-400 mt-0.5 transition-colors duration-200">Conectá, colaborá y chateá con otros alumnos del campus.</p>
        </div>
      </div>

      {/* Notificaciones flotantes */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-xs mb-4 max-w-xl animate-fade-in">
          ⚠️ {error}
        </div>
      )}
      {mensaje && (
        <div className="bg-green-50 dark:bg-emerald-950/30 border border-green-200 dark:border-emerald-900/50 text-green-600 dark:text-emerald-400 rounded-xl px-4 py-3 text-xs mb-4 max-w-xl animate-fade-in">
          ✓ {mensaje}
        </div>
      )}

      {/* TABS CONTROLS (Responsive) */}
      <div className="border-b border-gray-200 dark:border-slate-800 flex gap-6 mb-6 transition-colors duration-200">
        <button
          onClick={() => setTabActiva("amigos")}
          className={`pb-3 text-sm font-semibold relative transition-colors duration-200 ${
            tabActiva === "amigos" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
          }`}
        >
          Mis Amigos ({amigos.length})
          {tabActiva === "amigos" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setTabActiva("solicitudes")}
          className={`pb-3 text-sm font-semibold relative transition-colors duration-200 flex items-center gap-2 ${
            tabActiva === "solicitudes" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
          }`}
        >
          Solicitudes Recibidas ({solicitudes.length})
          {solicitudes.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
              {solicitudes.length}
            </span>
          )}
          {tabActiva === "solicitudes" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">Sincronizando conexiones...</p>
        </div>
      ) : tabActiva === "amigos" ? (
        
        /* --- PESTAÑA: MIS AMIGOS --- */
        amigos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {amigos.map((amigo) => {
              const iniciales = `${amigo.nombre[0]}${amigo.apellido[0]}`.toUpperCase();
              return (
                <div 
                  key={amigo.id} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header de Tarjeta */}
                    <div className="flex items-center gap-3 mb-4">
                      {renderAvatar(amigo.Perfil?.foto_perfil || amigo.perfil?.foto_perfil, iniciales)}
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-tight truncate transition-colors duration-200">
                          {amigo.nombre} {amigo.apellido}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-slate-400 truncate transition-colors duration-200">
                          @{amigo.nombre_usuario}
                        </p>
                      </div>
                    </div>

                    {/* Información Académica */}
                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-slate-400 mb-4 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors duration-200">
                      <p className="truncate">
                        <strong className="text-gray-400 dark:text-slate-500">Carrera:</strong> {CARRERAS[amigo.id_carrera] || "Ingeniería"}
                      </p>
                      <p>
                        <strong className="text-gray-400 dark:text-slate-500">Año de ingreso:</strong> {amigo.anio_ingreso || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 mt-2">
                    {(() => {
                      const cantMensajesAmigo = mensajesPendientes.filter(m => m.id_remitente === amigo.id).length;
                      return (
                        <div className="relative w-full">
                          <button
                            onClick={() => navigate(`/chat-privado/${amigo.id}`)}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold text-center transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none"
                          >
                            💬 Enviar Mensaje
                          </button>
                          {cantMensajesAmigo > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md pointer-events-none">
                              {cantMensajesAmigo}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/perfil/${amigo.id}`)}
                        className="flex-1 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors duration-200 border border-gray-200 dark:border-slate-700"
                      >
                        Ver Perfil
                      </button>
                      <button
                        onClick={() => rechazarOEliminar(amigo.id, true)}
                        disabled={procesandoId === amigo.id}
                        className="flex-1 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 dark:text-red-400 rounded-lg text-xs font-bold transition-colors duration-200 border border-transparent disabled:opacity-50"
                      >
                        {procesandoId === amigo.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State Amigos */
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 max-w-xl mx-auto mt-6 transition-colors duration-200">
            <span className="text-5xl block mb-3">👥</span>
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 transition-colors duration-200">Aún no tienes amigos agregados</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 mb-5 transition-colors duration-200">¡Utiliza la lupita de arriba en la cabecera para buscar compañeros y conectar!</p>
          </div>
        )
      ) : (
        
        /* --- PESTAÑA: SOLICITUDES PENDIENTES --- */
        solicitudes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {solicitudes.map((sol) => {
              const iniciales = `${sol.usuario.nombre[0]}${sol.usuario.apellido[0]}`.toUpperCase();
              return (
                <div 
                  key={sol.id_solicitud} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header de Tarjeta */}
                    <div className="flex items-center gap-3 mb-4">
                      {renderAvatar(sol.usuario.Perfil?.foto_perfil || sol.usuario.perfil?.foto_perfil, iniciales)}
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-tight truncate transition-colors duration-200">
                          {sol.usuario.nombre} {sol.usuario.apellido}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-slate-400 truncate transition-colors duration-200">
                          @{sol.usuario.nombre_usuario}
                        </p>
                      </div>
                    </div>

                    {/* Detalles académicos del remitente */}
                    <div className="space-y-1 text-xs text-gray-500 dark:text-slate-400 mb-4 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors duration-200">
                      <p className="truncate">
                        <strong className="text-gray-400 dark:text-slate-500">Carrera:</strong> {CARRERAS[sol.usuario.id_carrera] || "Ingeniería"}
                      </p>
                      <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold mt-1">
                        Recibida: {new Date(sol.fecha_solicitud).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Acciones de Solicitud */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => aceptarSolicitud(sol.usuario.id)}
                      disabled={procesandoId === sol.usuario.id}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors duration-200 shadow-sm disabled:opacity-50"
                    >
                      {procesandoId === sol.usuario.id ? "Aceptando..." : "Aceptar"}
                    </button>
                    <button
                      onClick={() => rechazarOEliminar(sol.usuario.id)}
                      disabled={procesandoId === sol.usuario.id}
                      className="flex-1 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors duration-200 disabled:opacity-50 border-none"
                    >
                      {procesandoId === sol.usuario.id ? "..." : "Rechazar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State Solicitudes */
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 max-w-xl mx-auto mt-6 transition-colors duration-200">
            <span className="text-5xl block mb-3">📬</span>
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 transition-colors duration-200">Bandeja de entrada limpia</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 transition-colors duration-200">No tienes solicitudes pendientes de respuesta por el momento.</p>
          </div>
        )
      )}
    </div>
  );
};

export default MisConexiones;
