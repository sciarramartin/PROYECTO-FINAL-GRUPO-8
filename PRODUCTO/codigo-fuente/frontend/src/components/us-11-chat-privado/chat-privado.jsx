// components/us-11-chat-privado/chat-privado.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const ChatPrivado = () => {
  const { amigoId } = useParams();
  const navigate = useNavigate();
  
  const [amigo, setAmigo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Obtener datos del usuario logueado
  const usuarioGuardado = sessionStorage.getItem("usuario");
  const usuarioLogueado = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const miUsuarioId = usuarioLogueado ? usuarioLogueado.id : null;

  // 1. Cargar datos del amigo y el historial del chat privado
  useEffect(() => {
    const cargarChat = async () => {
      setCargando(true);
      setError("");
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const headers = { Authorization: `Bearer ${token}` };

        // Cargar datos del perfil del amigo
        const amigoRes = await axios.get(`${apiUrl}/usuarios/${amigoId}`, { headers });
        setAmigo(amigoRes.data);

        // Cargar historial de chat privado
        const chatRes = await axios.get(`${apiUrl}/chat-privado/${amigoId}`, { headers });
        setMensajes(chatRes.data);
      } catch (err) {
        console.error("Error al cargar chat privado:", err);
        setError(err.response?.data?.error || "Error al sincronizar el chat privado.");
      } finally {
        setCargando(false);
      }
    };

    if (amigoId && token) {
      cargarChat();
    }
  }, [amigoId, token]);

  // 2. Escuchar mensajes nuevos en tiempo real vía WebSockets (Socket.io)
  useEffect(() => {
    if (window.socket && amigoId) {
      const manejarMensajePrivado = (mensajeNuevo) => {
        // Validar que el mensaje pertenezca a esta conversación
        const esDeEsteAmigo = mensajeNuevo.id_remitente === parseInt(amigoId, 10);
        const esParaEsteAmigo = mensajeNuevo.id_destinatario === parseInt(amigoId, 10);

        if (esDeEsteAmigo || esParaEsteAmigo) {
          setMensajes((prev) => {
            // Evitar empujar duplicados si ya existen localmente
            if (prev.some((m) => m.id === mensajeNuevo.id)) return prev;
            return [...prev, mensajeNuevo];
          });
        }
      };

      // Escuchar el evento de mensaje privado
      window.socket.on("mensaje_privado", manejarMensajePrivado);

      return () => {
        window.socket.off("mensaje_privado", manejarMensajePrivado);
      };
    }
  }, [amigoId]);

  // 3. Hacer auto-scroll suave hacia el fondo del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // 4. Enviar un nuevo mensaje privado
  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || enviando) return;

    setEnviando(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(
        `${apiUrl}/chat-privado/${amigoId}`,
        { contenido: nuevoMensaje.trim() },
        { headers }
      );

      // Añadir el mensaje de forma reactiva localmente en la lista de mensajes
      setMensajes((prev) => [...prev, res.data]);
      setNuevoMensaje("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      // Opcional: mostrar un error temporal
    } finally {
      setEnviando(false);
    }
  };

  // Helper para agrupar mensajes por fecha de envío
  const agruparMensajesPorFecha = (mensajesList) => {
    const grupos = {};
    mensajesList.forEach((msg) => {
      const fecha = new Date(msg.createdAt).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }
      grupos[fecha].push(msg);
    });
    return grupos;
  };

  const mensajesAgrupados = agruparMensajesPorFecha(mensajes);
  const inicialesAmigo = amigo ? `${amigo.nombre[0]}${amigo.apellido[0]}`.toUpperCase() : "A";

  return (
    <div className="max-w-4xl mx-auto px-2">
      
      {/* Botón de Retorno */}
      <button
        onClick={() => navigate("/conexiones")}
        className="mb-4 text-xs font-bold text-gray-500 hover:text-indigo-600 transition flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
      >
        ← Volver a Conexiones
      </button>

      {/* RENDER CUADRO CHAT PRIVADO */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white border border-gray-150 rounded-2xl p-6 shadow-sm gap-2">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400 font-medium">Sincronizando chat privado...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] bg-white border border-gray-150 rounded-2xl p-6 shadow-sm text-center">
          <span className="text-4xl mb-3">⚠️</span>
          <h4 className="text-sm font-bold text-gray-800">No se pudo cargar el chat</h4>
          <p className="text-xs text-red-500 mt-1 max-w-sm">{error}</p>
          <button
            onClick={() => navigate("/conexiones")}
            className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition border-none cursor-pointer"
          >
            Volver a Conexiones
          </button>
        </div>
      ) : (
        
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden flex flex-col justify-between h-[580px]">
          
          {/* 1. CABECERA CHAT */}
          <div className="bg-gray-50 border-b border-gray-150 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                {inicialesAmigo}
              </div>
              {/* Info Amigo */}
              <div className="min-w-0">
                <h3 className="text-xs font-extrabold text-gray-850 truncate leading-tight">
                  {amigo.nombre} {amigo.apellido}
                </h3>
                <p className="text-[9px] text-indigo-600 font-medium mt-0.5 truncate">
                  🎓 {CARRERAS[amigo.id_carrera] || "Ingeniería"} • @{amigo.nombre_usuario}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-bold">Chat Directo</span>
            </div>
          </div>

          {/* 2. AREA DE MENSAJES (Scrollable) */}
          <div className="flex-1 bg-slate-50 overflow-y-auto px-5 py-4 space-y-4 max-h-[460px]">
            {mensajes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-70">
                <span className="text-4xl mb-2">💬</span>
                <h4 className="text-xs font-bold text-gray-700">¡Inicia la conversación!</h4>
                <p className="text-[10px] text-gray-400 max-w-[240px] mt-0.5">
                  Mandale un mensaje privado a tu amigo para coordinar y estudiar juntos.
                </p>
              </div>
            ) : (
              Object.keys(mensajesAgrupados).map((fechaStr) => (
                <div key={fechaStr} className="space-y-3.5">
                  {/* Divisor de Fecha */}
                  <div className="flex justify-center my-3">
                    <span className="bg-gray-200/70 backdrop-blur-xs text-gray-500 text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {fechaStr}
                    </span>
                  </div>

                  {/* Mensajes del Grupo de Fecha */}
                  {mensajesAgrupados[fechaStr].map((msg) => {
                    const esMiMensaje = msg.id_remitente === miUsuarioId;
                    const horaStr = new Date(msg.createdAt).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${esMiMensaje ? "justify-end" : "justify-start"} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2 shadow-xs leading-normal flex flex-col ${
                            esMiMensaje
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-white border border-gray-150 text-gray-800 rounded-tl-none"
                          }`}
                        >
                          <p className="text-xs font-normal whitespace-pre-wrap break-words">{msg.contenido}</p>
                          
                          <div
                            className={`flex items-center justify-end gap-1 text-[8.5px] mt-1 shrink-0 ${
                              esMiMensaje ? "text-indigo-250" : "text-gray-400"
                            }`}
                          >
                            <span>{horaStr}</span>
                            {esMiMensaje && (
                              <span className="text-[10px] font-bold">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 3. INPUT CHAT */}
          <form
            onSubmit={handleEnviarMensaje}
            className="bg-white border-t border-gray-150 px-5 py-3 flex items-center gap-3"
          >
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje privado..."
              disabled={enviando}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-850 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              required
            />
            <button
              type="submit"
              disabled={!nuevoMensaje.trim() || enviando}
              className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 border-none transition cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
              title="Enviar Mensaje"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 transform rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 19l9-7-9-7v14z"
                />
              </svg>
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default ChatPrivado;
