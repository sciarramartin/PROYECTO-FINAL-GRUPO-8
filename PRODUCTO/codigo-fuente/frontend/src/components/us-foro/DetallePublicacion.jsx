import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import  SeccionComentarios from './SeccionComentarios'; 
import { 
  FiArrowUp, 
  FiArrowDown, 
  FiMessageSquare, 
  FiShare2, 
  FiBookmark, 
  FiMoreHorizontal, 
  FiChevronRight,
  FiCornerDownRight,
  FiAlertCircle,
  FiEdit,
  FiTrash2,
  FiFlag,
  FiBold,
  FiItalic,
  FiCode,
  FiLink,
  FiList,
  FiSmile
} from "react-icons/fi";

const DetallePublicacion = () => {
  const { materiaId, postId } = useParams();
  const navigate = useNavigate();
  
  const [datosHilo, setDatosHilo] = useState({ publicacion: null, comentarios: [] });
  const [cargando, setCargando] = useState(true);
  const [alertaTeammate, setAlertaTeammate] = useState(null);

  // Obtener ID del usuario actual para comparar si es autor
  let usuarioActual = {};
  try {
    const uStr = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
    if (uStr && uStr !== "undefined") usuarioActual = JSON.parse(uStr);
  } catch (e) {
    console.error("Error parseando usuario actual:", e);
  }

  useEffect(() => {
    const fetchHilo = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await axios.get(`${apiUrl}/publicaciones/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDatosHilo(response.data);
      } catch (error) {
        console.error("Error al cargar detalle del hilo:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchHilo();
  }, [postId]);

  const mostrarMensajeTeammate = (mensaje) => {
    setAlertaTeammate(mensaje);
    setTimeout(() => setAlertaTeammate(null), 5000);
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
      return (
        <div className={`${sizeClass} rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center shrink-0`}>
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
      />
    );
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="animate-spin text-2xl text-indigo-650">⌛</span>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando publicación...</p>
      </div>
    );
  }

  const { publicacion, comentarios } = datosHilo;

  if (!publicacion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Publicación no encontrada</h3>
        <button 
          onClick={() => navigate(`/foros/${materiaId}`)}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition shadow-sm"
        >
          Volver al foro
        </button>
      </div>
    );
  }

  const esAutorPublicacion = publicacion.Autor?.id === usuarioActual?.id;
  const nombreAutor = publicacion.Autor ? `${publicacion.Autor.nombre} ${publicacion.Autor.apellido}` : "Usuario Anónimo";
  const inicialesAutor = publicacion.Autor ? `${publicacion.Autor.nombre[0]}${publicacion.Autor.apellido[0]}`.toUpperCase() : "US";
  const esAutorDocente = publicacion.Autor?.id_tipo_usuario === 2;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Alerta de US Deshabilitada */}
      {alertaTeammate && (
        <div className="fixed top-20 right-6 left-6 md:left-auto md:w-96 z-50 bg-amber-50 dark:bg-amber-950/80 border border-amber-250 dark:border-amber-900 text-amber-900 dark:text-amber-300 p-4 rounded-xl shadow-lg flex items-start gap-2.5 animate-in fade-in slide-in-from-top-4">
          <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold">Funcionalidad Excluida</p>
            <p className="text-[11px] mt-0.5 leading-relaxed">{alertaTeammate}</p>
          </div>
        </div>
      )}

      {/* Migas de Pan */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-semibold mb-4 overflow-x-auto whitespace-nowrap">
        <button onClick={() => navigate("/foros")} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer border-none bg-transparent transition">
          Foros
        </button>
        <FiChevronRight className="w-3.5 h-3.5 shrink-0" />
        <button onClick={() => navigate(`/foros/${materiaId}`)} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer border-none bg-transparent transition">
          {publicacion.Materia?.nombre || "Foro"}
        </button>
        <FiChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="text-zinc-650 dark:text-zinc-350 truncate max-w-[200px] sm:max-w-xs">{publicacion.titulo}</span>
      </div>

      {/* Grid General */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Izquierdo: Detalle y Comentarios */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Tarjeta de la Publicación Principal */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex gap-4">
              
              {/* Votos (UI Shell) */}
              <div className="flex flex-col items-center justify-start gap-1 text-zinc-450 shrink-0">
                <button 
                  onClick={() => mostrarMensajeTeammate("El voto está deshabilitado temporalmente para no interferir con la US: 'Reaccionar a publicaciones'.")}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent text-zinc-400 dark:text-zinc-500 transition"
                >
                  <FiArrowUp className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold">{publicacion.votos || 0}</span>
                <button 
                  onClick={() => mostrarMensajeTeammate("El voto está deshabilitado temporalmente para no interferir con la US: 'Reaccionar a publicaciones'.")}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent text-zinc-400 dark:text-zinc-500 transition"
                >
                  <FiArrowDown className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido Principal */}
              <div className="min-w-0 flex-1">
                
                {/* Cabecera del Autor */}
                <div className="flex items-center gap-2.5 text-xs text-zinc-505 dark:text-zinc-400">
                  {renderAvatarChico(publicacion.Autor?.Perfil?.foto_perfil, inicialesAutor)}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{nombreAutor}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        esAutorDocente 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-350' 
                          : 'bg-indigo-50 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350'
                      }`}>
                        {esAutorDocente ? 'Docente' : 'Estudiante'}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-none mt-0.5">
                      Publicado el {formatearFecha(publicacion.createdAt)}
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-full shrink-0">
                    {publicacion.categoria || "General"}
                  </span>
                </div>

                {/* Título */}
                <h1 className="text-lg md:text-xl font-extrabold text-zinc-850 dark:text-zinc-50 leading-tight mt-4 mb-2">
                  {publicacion.titulo}
                </h1>

                {/* Cuerpo del Mensaje */}
                <div className="text-xs md:text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap mt-3 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-150/40 dark:border-zinc-800/20">
                  {publicacion.contenido}
                </div>

                {/* Etiquetas */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {["Teoremas", "Límites", "Integrales"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450 text-[10px] font-bold rounded">
                      #{tag.toLowerCase()}
                    </span>
                  ))}
                </div>

                {/* Footer de Acciones de Publicación */}
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 mt-5 pt-4 text-[11px] font-bold text-zinc-450 dark:text-zinc-500">
                  
                  
                  <div className="flex items-center gap-1.5">
                    <FiMessageSquare className="w-4 h-4 text-zinc-400" />
                    <span>{comentarios.length} comentarios</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => mostrarMensajeTeammate("El guardado está fuera de los alcances de la US actual.")}
                      className="flex items-center gap-1.5 hover:text-indigo-650 dark:hover:text-indigo-400 border-none bg-transparent cursor-pointer transition"
                    >
                      <FiBookmark className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Guardar</span>
                    </button>
                    <button 
                      onClick={() => mostrarMensajeTeammate("Compartir está fuera de los alcances de la US actual.")}
                      className="flex items-center gap-1.5 hover:text-indigo-650 dark:hover:text-indigo-400 border-none bg-transparent cursor-pointer transition"
                    >
                      <FiShare2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Compartir</span>
                    </button>
                    <button 
                      onClick={() => mostrarMensajeTeammate("Las opciones adicionales corresponden a otras historias de usuario.")}
                      className="p-1 hover:text-indigo-650 dark:hover:text-indigo-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border-none bg-transparent cursor-pointer transition"
                    >
                      <FiMoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Comentarios */}
          <SeccionComentarios 
            idPublicacion={postId} 
            idUsuarioActual={usuarioActual.id}
          />
        </div>

        {/* Lado Derecho: Acciones e Información del Hilo */}
        <div className="space-y-4">
          
          {/* Tarjeta de Información del Hilo */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
              Información del hilo
            </h3>
            
            <div className="space-y-3.5 text-xs text-zinc-650 dark:text-zinc-400">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-450">Materia</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold truncate max-w-[150px]">{publicacion.Materia?.nombre}</span>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-450">Publicado por</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold truncate max-w-[150px]">{nombreAutor}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-zinc-450">Fecha</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold">{formatearFecha(publicacion.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Acciones */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Acciones
            </h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => mostrarMensajeTeammate(`La edición está deshabilitada temporalmente para no interferir con la US: 'Editar publicación propia'.` + (esAutorPublicacion ? ' (Esta publicación es tuya)' : ' (Esta publicación es de otro usuario)'))}
                className="w-full py-2.5 px-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold border border-zinc-250 dark:border-zinc-800 cursor-pointer transition flex items-center justify-start gap-2.5"
              >
                <FiEdit className="w-4 h-4 text-zinc-400" />
                <span>Editar publicación</span>
              </button>
              
              <button 
                onClick={() => mostrarMensajeTeammate(`La eliminación está deshabilitada temporalmente para no interferir con la US: 'Eliminar publicación propia'.` + (esAutorPublicacion ? ' (Esta publicación es tuya)' : ' (Esta publicación es de otro usuario)'))}
                className="w-full py-2.5 px-3 bg-zinc-50 hover:bg-red-50 dark:bg-zinc-800/50 dark:hover:bg-red-950/20 text-zinc-700 dark:text-zinc-300 hover:text-red-650 dark:hover:text-red-400 rounded-xl text-xs font-bold border border-zinc-250 dark:border-zinc-800 hover:border-red-200 cursor-pointer transition flex items-center justify-start gap-2.5"
              >
                <FiTrash2 className="w-4 h-4 text-zinc-400 hover:text-red-500" />
                <span>Eliminar publicación</span>
              </button>

              <div className="w-full h-[1px] bg-zinc-100 dark:bg-zinc-800 my-2" />

              <button 
                onClick={() => mostrarMensajeTeammate("El guardado está fuera de los alcances de la US actual.")}
                className="w-full py-2.5 px-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold border border-zinc-250 dark:border-zinc-800 cursor-pointer transition flex items-center justify-start gap-2.5"
              >
                <FiBookmark className="w-4 h-4 text-zinc-400" />
                <span>Guardar publicación</span>
              </button>
              <button 
                onClick={() => mostrarMensajeTeammate("Compartir está fuera de los alcances de la US actual.")}
                className="w-full py-2.5 px-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold border border-zinc-250 dark:border-zinc-800 cursor-pointer transition flex items-center justify-start gap-2.5"
              >
                <FiShare2 className="w-4 h-4 text-zinc-400" />
                <span>Compartir enlace</span>
              </button>
              <button 
                onClick={() => mostrarMensajeTeammate("Reportar está fuera del alcance de la US actual.")}
                className="w-full py-2.5 px-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold border border-zinc-250 dark:border-zinc-800 cursor-pointer transition flex items-center justify-start gap-2.5"
              >
                <FiFlag className="w-4 h-4 text-zinc-400" />
                <span>Reportar publicación</span>
              </button>
            </div>
          </div>

          {/* Tarjeta de Reglas del Foro */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
              Reglas del foro
            </h3>
            <ol className="space-y-3 pl-0 list-none m-0">
              <li className="flex gap-2.5 text-xs text-zinc-650 dark:text-zinc-400 leading-normal">
                <span className="w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center font-bold text-zinc-500 text-[10px] shrink-0">1</span>
                <span>Sé respetuoso y cordial con todos.</span>
              </li>
              <li className="flex gap-2.5 text-xs text-zinc-650 dark:text-zinc-400 leading-normal">
                <span className="w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center font-bold text-zinc-500 text-[10px] shrink-0">2</span>
                <span>Publicá contenido relacionado con la materia.</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePublicacion;
