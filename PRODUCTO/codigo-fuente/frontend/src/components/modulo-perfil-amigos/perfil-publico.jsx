// frontend/src/components/modulo-perfil-amigos/perfil-publico.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Helper para traducir IDs de carreras a sus nombres oficiales
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

const PerfilPublico = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [estudiante, setEstudiante] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [relacion, setRelacion] = useState("ninguno"); // ninguno, pendiente_enviada, pendiente_recibida, aceptado, mismo_usuario
  const [cargando, setCargando] = useState(true);
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const cargarDatosPerfil = async () => {
    setCargando(true);
    setError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      
      // 1. Obtener datos del alumno y su perfil académico (en una sola llamada elegante)
      const perfilRes = await axios.get(`${apiUrl}/perfiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEstudiante(perfilRes.data.usuario);
      setPerfil(perfilRes.data.perfil);

      // 2. Obtener estado de relación (amigos)
      const relacionRes = await axios.get(`${apiUrl}/amistades/estado/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRelacion(relacionRes.data.estado);
      
    } catch (err) {
      console.error("Error al cargar perfil público:", err);
      setError("No se pudo cargar la información de este perfil estudiantil.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarDatosPerfil();
    }
  }, [id]);

  const realizarAccion = async (metodo, urlSuffix, body = {}) => {
    setProcesandoAccion(true);
    setError("");
    setMensaje("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios({
        method: metodo,
        url: `${apiUrl}/amistades/${urlSuffix}`,
        data: body,
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensaje(response.data.mensaje || "Operación realizada con éxito");

      // Volver a cargar el estado de la relación para actualizar botones
      const relacionRes = await axios.get(`${apiUrl}/amistades/estado/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRelacion(relacionRes.data.estado);
    } catch (err) {
      console.error(`Error en acción de amistad ${urlSuffix}:`, err);
      setError(err.response?.data?.error || "Error al realizar la acción de amistad.");
    } finally {
      setProcesandoAccion(false);
    }
  };

  const enviarSolicitud = () => {
    realizarAccion("post", "solicitar", { id_usuario_destino: Number(id) });
  };

  const aceptarSolicitud = () => {
    realizarAccion("put", "aceptar", { id_usuario_origen: Number(id) });
  };

  const rechazarOEliminar = () => {
    if (window.confirm("¿Estás seguro de que quieres realizar esta acción de conexión?")) {
      realizarAccion("delete", "eliminar", { id_usuario_b: Number(id) });
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400 font-medium">Cargando perfil del estudiante...</p>
      </div>
    );
  }

  if (error && !estudiante) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border border-gray-150 text-center">
        <span className="text-5xl block mb-3">⚠️</span>
        <p className="text-base font-bold text-gray-800 mb-4">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition border-none cursor-pointer"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido}`;
  
  // Renderizar avatar (Emoji o Base64 o Iniciales)
  const renderAvatar = (foto, nombreCompleto) => {
    if (!foto) {
      const iniciales = `${nombreCompleto[0]}${nombreCompleto.split(" ")[1]?.[0] || ""}`.toUpperCase();
      return (
        <div className="w-20 h-20 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-700 text-2xl font-black shrink-0 shadow-sm">
          {iniciales}
        </div>
      );
    }

    if (foto.length <= 4) {
      return (
        <div className="w-20 h-20 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center text-4xl shrink-0 shadow-sm">
          {foto}
        </div>
      );
    }

    return (
      <img
        src={foto}
        alt="Avatar estudiante"
        className="w-20 h-20 rounded-full object-cover border border-gray-150 shadow-sm shrink-0"
      />
    );
  };

  // Parsear áreas de interés
  let interesesList = [];
  if (perfil?.intereses) {
    try {
      interesesList = JSON.parse(perfil.intereses);
    } catch (e) {
      interesesList = [];
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      
      {/* Contenedor Principal (Estilo Premium y Limpio de Mis Conexiones) */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        
        {/* Cabecera Estética Simplificada */}
        <div className="bg-gray-50 border-b border-gray-150 p-6 flex flex-col md:flex-row items-center gap-5">
          {renderAvatar(perfil?.foto_perfil, nombreCompleto)}
          
          <div className="text-center md:text-left min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight truncate">
              {nombreCompleto}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1.5">
              <span className="text-xs text-gray-400">@{estudiante.nombre_usuario}</span>
              {perfil?.apodo && (
                <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-650 px-2 py-0.5 rounded-full font-bold">
                  "{perfil.apodo}"
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              🎓 Carrera: <span className="font-semibold text-gray-700">{CARRERAS[estudiante.id_carrera] || "Ingeniería"}</span>
            </p>
          </div>
        </div>

        {/* Contenido del Perfil */}
        <div className="p-6 space-y-6">
          
          {/* Ficha Académica & Rol Preferido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Año de Cursado</h4>
              <p className="text-sm font-bold text-gray-800">
                {perfil?.anio_cursado 
                  ? `${perfil.anio_cursado}° Año` 
                  : "🔒 Oculto / No configurado"}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rol preferido en equipos</h4>
              <p className="text-sm font-bold text-indigo-600">
                {perfil?.rol_equipo || "No especificado"}
              </p>
            </div>

          </div>

          {/* Biografía */}
          {perfil?.biografia && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Sobre mí</h4>
              <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-4 italic leading-relaxed break-words">
                "{perfil.biografia}"
              </p>
            </div>
          )}

          {/* Áreas de Interés */}
          {interesesList.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Áreas de Interés</h4>
              <div className="flex flex-wrap gap-2">
                {interesesList.map((interes, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-650 px-3 py-1 rounded-full font-bold"
                  >
                    {interes}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Canales de Contacto */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Canales de Contacto</h4>
            
            {(!perfil?.link_discord && !perfil?.link_telegram && !perfil?.link_whatsapp && !perfil?.link_github && !perfil?.link_linkedin) ? (
              <p className="text-xs text-gray-400 italic">Este compañero no ha cargado redes de contacto todavía.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Discord */}
                {perfil?.link_discord && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 text-xs">
                    <span className="text-base">🎮</span>
                    <span className="text-gray-500 font-semibold truncate">Discord: <strong className="text-gray-800">{perfil.link_discord}</strong></span>
                  </div>
                )}
                
                {/* Telegram */}
                {perfil?.link_telegram && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 text-xs">
                    <span className="text-base">✈️</span>
                    <span className="text-gray-500 font-semibold truncate">Telegram: <strong className="text-gray-800">{perfil.link_telegram}</strong></span>
                  </div>
                )}

                {/* WhatsApp */}
                {perfil?.link_whatsapp && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 text-xs">
                    <span className="text-base">💬</span>
                    <span className="text-gray-500 font-semibold truncate">WhatsApp: <strong className="text-gray-800">{perfil.link_whatsapp}</strong></span>
                  </div>
                )}

                {/* GitHub */}
                {perfil?.link_github && (
                  <a
                    href={perfil.link_github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl p-3 flex items-center justify-between text-xs text-gray-600 font-bold transition group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">🐙</span> Ver Perfil de GitHub
                    </span>
                    <span className="text-gray-400 group-hover:text-gray-700 transition">➔</span>
                  </a>
                )}

                {/* LinkedIn */}
                {perfil?.link_linkedin && (
                  <a
                    href={perfil.link_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl p-3 flex items-center justify-between text-xs text-gray-600 font-bold transition group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">💼</span> Ver LinkedIn Profesional
                    </span>
                    <span className="text-gray-400 group-hover:text-gray-700 transition">➔</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Alertas de Operaciones */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
              ⚠️ {error}
            </p>
          )}
          {mensaje && (
            <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              ✓ {mensaje}
            </p>
          )}

          {/* Botones de Acción de Amistad y Chat (Estilo Premium) */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            {relacion === "mismo_usuario" ? (
              <button
                onClick={() => navigate("/ajustes")}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-650 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                ⚙️ Editar mi Perfil Académico
              </button>
            ) : relacion === "ninguno" ? (
              <button
                onClick={enviarSolicitud}
                disabled={procesandoAccion}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                {procesandoAccion ? "Enviando..." : "Conectar / Agregar Amigo"} 👤➕
              </button>
            ) : relacion === "pendiente_enviada" ? (
              <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                <button
                  disabled
                  className="w-full px-6 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  Solicitud Pendiente ⏳
                </button>
                <button
                  onClick={rechazarOEliminar}
                  disabled={procesandoAccion}
                  className="text-xs text-red-500 hover:text-red-700 font-bold transition cursor-pointer bg-transparent border-none"
                >
                  {procesandoAccion ? "Cancelando..." : "Cancelar Solicitud"}
                </button>
              </div>
            ) : relacion === "pendiente_recibida" ? (
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <p className="text-[10px] text-indigo-650 font-bold text-center">
                  ¡Te envió una solicitud de amistad!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={aceptarSolicitud}
                    disabled={procesandoAccion}
                    className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 border-none cursor-pointer"
                  >
                    {procesandoAccion ? "..." : "Aceptar"} ✓
                  </button>
                  <button
                    onClick={rechazarOEliminar}
                    disabled={procesandoAccion}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition disabled:opacity-50 border-none cursor-pointer"
                  >
                    {procesandoAccion ? "..." : "Rechazar"}
                  </button>
                </div>
              </div>
            ) : relacion === "aceptado" ? (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                <button
                  onClick={() => navigate(`/chat-privado/${id}`)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  💬 Iniciar Chat Privado
                </button>
                <button
                  onClick={rechazarOEliminar}
                  disabled={procesandoAccion}
                  className="w-full sm:w-auto px-6 py-2.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {procesandoAccion ? "Eliminando..." : "Eliminar de mis amigos"}
                </button>
              </div>
            ) : null}
          </div>

        </div>
      </div>

      {/* Botón de Retorno */}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-650 transition mx-auto border-none bg-transparent cursor-pointer"
      >
        ← Volver atrás
      </button>
    </div>
  );
};

export default PerfilPublico;
