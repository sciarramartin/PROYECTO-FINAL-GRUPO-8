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
      // 1. Obtener datos del alumno
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const perfilRes = await axios.get(`${apiUrl}/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEstudiante(perfilRes.data);

      // 2. Obtener estado de relación
      const relacionRes = await axios.get(`${apiUrl}/amistades/estado/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRelacion(relacionRes.data.estado);
    } catch (err) {
      console.error("Error al cargar perfil:", err);
      setError("No se pudo cargar la información del perfil.");
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

      // Volver a cargar el estado de la relación para actualizar el botón
      const relacionRes = await axios.get(`${apiUrl}/amistades/estado/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRelacion(relacionRes.data.estado);
    } catch (err) {
      console.error(`Error en acción ${urlSuffix}:`, err);
      setError(err.response?.data?.error || "Error al realizar la acción.");
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
    if (window.confirm("¿Estás seguro de que quieres realizar esta acción?")) {
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
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border border-gray-100 text-center">
        <span className="text-5xl block mb-3">⚠️</span>
        <p className="text-base font-bold text-gray-800 mb-4">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const iniciales = estudiante
    ? `${estudiante.nombre[0]}${estudiante.apellido[0]}`.toUpperCase()
    : "ST";

  return (
    <div className="max-w-xl mx-auto mt-6 px-4">
      {/* Contenedor Principal con Glassmorphism sutil */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">

        {/* Banner Superior Estético */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-end justify-center pb-4 relative">
          {/* Círculo de Avatar en Solapamiento */}
          <div className="absolute -bottom-12 w-24 h-24 rounded-full bg-white p-1.5 shadow-md">
            <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 text-2xl font-bold border border-indigo-100">
              {iniciales}
            </div>
          </div>
        </div>

        {/* Detalles del Perfil */}
        <div className="pt-16 pb-8 px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {estudiante.nombre} {estudiante.apellido}
          </h2>
          <p className="text-sm text-gray-400 mt-1 mb-4 font-medium">
            @{estudiante.nombre_usuario}
          </p>

          {/* Información Académica (Responsive Card Grid) */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 inline-flex flex-col gap-2 w-full text-left max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs border-b border-gray-150 pb-2">
              <span className="text-gray-400 font-semibold uppercase tracking-wider">Carrera</span>
              <span className="text-gray-700 font-bold">
                {CARRERAS[estudiante.id_carrera] || "Ingeniería"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-400 font-semibold uppercase tracking-wider">Año de Ingreso</span>
              <span className="text-gray-700 font-bold">{estudiante.anio_ingreso || "N/A"}</span>
            </div>
          </div>

          {/* Notificaciones de Operaciones */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4 max-w-sm mx-auto">
              {error}
            </p>
          )}
          {mensaje && (
            <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4 max-w-sm mx-auto">
              {mensaje}
            </p>
          )}

          {/* Botones de Acción de Amistad */}
          <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
            {relacion === "mismo_usuario" ? (
              <p className="text-xs text-gray-400 font-medium italic border border-dashed border-gray-300 rounded-full px-4 py-1.5">
                Este es tu perfil de estudiante público
              </p>
            ) : relacion === "ninguno" ? (
              <button
                onClick={enviarSolicitud}
                disabled={procesandoAccion}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {procesandoAccion ? "Enviando..." : "Conectar / Agregar Amigo"} 👤➕
              </button>
            ) : relacion === "pendiente_enviada" ? (
              <div className="flex flex-col gap-2 w-full">
                <button
                  disabled
                  className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Solicitud Pendiente ⏳
                </button>
                <button
                  onClick={rechazarOEliminar}
                  disabled={procesandoAccion}
                  className="w-full py-2 hover:bg-red-50 text-red-500 text-xs font-semibold rounded-xl transition"
                >
                  {procesandoAccion ? "Cancelando..." : "Cancelar Solicitud"}
                </button>
              </div>
            ) : relacion === "pendiente_recibida" ? (
              <div className="flex flex-col gap-2 w-full">
                <p className="text-xs text-indigo-600 font-bold mb-1">
                  ¡Te envió una solicitud de conexión!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={aceptarSolicitud}
                    disabled={procesandoAccion}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm disabled:opacity-50"
                  >
                    {procesandoAccion ? "..." : "Aceptar"} ✓
                  </button>
                  <button
                    onClick={rechazarOEliminar}
                    disabled={procesandoAccion}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition disabled:opacity-50"
                  >
                    {procesandoAccion ? "..." : "Rechazar"}
                  </button>
                </div>
              </div>
            ) : relacion === "aceptado" ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="w-full py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  Amigos Confirmados ✓ 👥
                </div>
                <button
                  onClick={rechazarOEliminar}
                  disabled={procesandoAccion}
                  className="w-full py-2 hover:bg-red-50 text-red-500 text-xs font-semibold rounded-xl transition"
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
        className="mt-6 flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition mx-auto"
      >
        ← Volver atrás
      </button>
    </div>
  );
};

export default PerfilPublico;
