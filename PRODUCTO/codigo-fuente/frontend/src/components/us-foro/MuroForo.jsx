import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CrearPublicacion from "./CrearPublicacion";
import axios from "axios";
import { 
  FiArrowUp, 
  FiArrowDown, 
  FiMessageSquare, 
  FiBookmark, 
  FiShare2, 
  FiMoreHorizontal, 
  FiPlus,
  FiBookOpen,
  FiChevronRight,
  FiInfo,
  FiMessageCircle,
  FiAlertCircle
} from "react-icons/fi";

const MuroForo = () => {
  const { materiaId } = useParams();
  const navigate = useNavigate();
  const [datosForo, setDatosForo] = useState({ materia: {}, publicaciones: [] });
  const [cargando, setCargando] = useState(true);
  const [vistaActual, setVistaActual] = useState('muro'); //sino crear
  
  // Para mostrar alertas de funcionalidad deshabilitada correspondiente a otras US
  const [alertaTeammate, setAlertaTeammate] = useState(null);

  useEffect(() => {
    const fetchForo = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await axios.get(`${apiUrl}/foro/materias/${materiaId}/publicaciones`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDatosForo(response.data);
      } catch (error) {
        console.error("Error al cargar foro de materia:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchForo();
  }, [materiaId]);

  const mostrarMensajeTeammate = (mensaje) => {
    setAlertaTeammate(mensaje);
    setTimeout(() => setAlertaTeammate(null), 5000);
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const difMs = ahora - fecha;
    const difMins = Math.floor(difMs / (1000 * 60));
    const difHoras = Math.floor(difMs / (1000 * 60 * 60));
    const difDias = Math.floor(difMs / (1000 * 60 * 60 * 24));

    if (difMins < 60) return `hace ${Math.max(1, difMins)} min`;
    if (difHoras < 24) return `hace ${difHoras} horas`;
    return `hace ${difDias} días`;
  };

  // Color de categorías
  const getColoresCategoria = (cat) => {
    switch (cat?.toLowerCase()) {
      case "duda":
        return "bg-indigo-150 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "opinión":
      case "opinion":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "recurso":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const getIniciales = (nombre) => {
    if (!nombre) return "US";
    return nombre.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
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

  const { materia, publicaciones } = datosForo;

  const refrescarMuro = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/foro/materias/${materiaId}/publicaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatosForo(response.data);
    } catch (error) {
      console.error("Error al actualizar foro de materia:", error);
    }
  };

  if (vistaActual === 'crear') {
    return (
        <CrearPublicacion 
            idMateriaActual={materiaId} // Usamos materiaId del useParams directamente por seguridad
            nombreMateriaActual={materia?.nombre || "Materia"}
            // 👇 QUITAMOS EL OBJETO FIJO: CrearPublicacion ya lo lee directo del localStorage
            onPublicacionCreada={() => {
                setVistaActual('muro');
                refrescarMuro(); // 🔥 ¡Mucho más elegante! Actualiza el listado en caliente sin recargar la pestaña
            }}
            onCancelar={() => setVistaActual('muro')}
        />
    );
  }

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

      {/* Breadcrumbs / Migas de Pan */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-semibold mb-4">
        <button onClick={() => navigate("/foros")} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer border-none bg-transparent transition">
          Foros
        </button>
        <FiChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-650 dark:text-zinc-350 truncate">{materia?.nombre || "Materia"}</span>
      </div>

      {/* Grid General */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Izquierdo: Listado de Publicaciones */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Cabecera del Muro */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <FiBookOpen className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
                <h1 className="text-xl font-extrabold text-zinc-850 dark:text-zinc-50 leading-tight">
                  Foro de {materia?.nombre || "Carga..."}
                </h1>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Espacio oficial para dudas, consultas, opiniones y recursos sobre la materia.
              </p>
            </div>
            <button
              onClick={() => setVistaActual('crear')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              <FiPlus className="w-4 h-4" />
              Crear publicación
            </button>
          </div>

          {/* Pestañas de Vista y Orden (UI Shell) */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold overflow-x-auto whitespace-nowrap scrollbar-none min-w-0">
              <button className="pb-2 border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 border-none bg-transparent cursor-pointer shrink-0">
                Publicaciones
              </button>
              <button 
                onClick={() => mostrarMensajeTeammate("El ordenamiento de publicaciones está deshabilitado temporalmente para no interferir con la US: 'Ordenar publicaciones del foro'.")}
                className="pb-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-355 border-none bg-transparent cursor-pointer transition shrink-0"
              >
                Más recientes
              </button>
              <button 
                onClick={() => mostrarMensajeTeammate("El ordenamiento de publicaciones está deshabilitado temporalmente para no interferir con la US: 'Ordenar publicaciones del foro'.")}
                className="pb-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-355 border-none bg-transparent cursor-pointer transition shrink-0"
              >
                Más votadas
              </button>
            </div>
            <div className="text-xs shrink-0">
              <button
                onClick={() => mostrarMensajeTeammate("El ordenamiento de publicaciones está deshabilitado temporalmente para no interferir con la US: 'Ordenar publicaciones del foro'.")}
                className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 font-semibold flex items-center gap-1 transition"
              >
                Ordenar por: <span className="text-indigo-600 dark:text-indigo-400">Relevancia</span>
              </button>
            </div>
          </div>

          {/* Listado Real de Publicaciones */}
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="animate-spin text-2xl text-indigo-650">⌛</span>
              <p className="text-sm text-zinc-500 dark:text-zinc-450">Cargando publicaciones...</p>
            </div>
          ) : publicaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 mb-3">
                <FiMessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 text-center">No existen publicaciones</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-450 max-w-sm mt-1 text-center">
                Aún no hay dudas ni aportes publicados en esta materia. ¡Sé el primero en crear una discusión académica!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {publicaciones.map((pub) => {
                const nombreCompleto = pub.Autor ? `${pub.Autor.nombre} ${pub.Autor.apellido}` : "Usuario Anónimo";
                const iniciales = pub.Autor ? `${pub.Autor.nombre[0]}${pub.Autor.apellido[0]}`.toUpperCase() : "US";
                const esDocente = pub.Autor?.id_tipo_usuario === 2;

                return (
                  <div 
                    key={pub.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex gap-4 transition shadow-sm hover:shadow-md hover:border-indigo-500/20"
                  >
                    {/* Flechas de Votos (UI Shell para Reaccionar) */}
                    <div className="flex flex-col items-center justify-start gap-1 text-zinc-450 shrink-0">
                      <button 
                        onClick={() => mostrarMensajeTeammate("Las reacciones y votos de publicaciones están deshabilitadas temporalmente para no interferir con la US: 'Reaccionar a publicaciones'.")}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent text-zinc-400 dark:text-zinc-500 transition"
                      >
                        <FiArrowUp className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold">{pub.votos || 0}</span>
                      <button 
                        onClick={() => mostrarMensajeTeammate("Las reacciones y votos de publicaciones están deshabilitadas temporalmente para no interferir con la US: 'Reaccionar a publicaciones'.")}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent text-zinc-400 dark:text-zinc-500 transition"
                      >
                        <FiArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Contenido de la Tarjeta */}
                    <div className="min-w-0 flex-1">
                      
                      {/* Autor, Rol, Fecha, Categoría */}
                      <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {renderAvatarChico(pub.Autor?.Perfil?.foto_perfil, iniciales)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{nombreCompleto}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              esDocente 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-350' 
                                : 'bg-indigo-50 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350'
                            }`}>
                              {esDocente ? 'Docente' : 'Estudiante'}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-none mt-0.5">
                            {formatearFecha(pub.createdAt)}
                          </p>
                        </div>
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getColoresCategoria(pub.categoria)}`}>
                          {pub.categoria || "General"}
                        </span>
                      </div>

                      {/* Título y Contenido */}
                      <div className="mt-3 min-w-0">
                        <button 
                          onClick={() => navigate(`/foros/${materiaId}/publicacion/${pub.id}`)}
                          className="text-left font-bold text-zinc-850 dark:text-zinc-50 hover:text-indigo-650 dark:hover:text-indigo-400 text-sm md:text-base leading-tight block w-full p-0 border-none bg-transparent cursor-pointer transition mb-1.5"
                        >
                          {pub.titulo}
                        </button>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {pub.contenido}
                        </p>
                      </div>

                      {/* Pie de la tarjeta */}
                      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 mt-4 pt-3.5 text-[11px] font-bold text-zinc-450 dark:text-zinc-500">
                        <button 
                          onClick={() => navigate(`/foros/${materiaId}/publicacion/${pub.id}`)}
                          className="flex items-center gap-1.5 hover:text-indigo-650 dark:hover:text-indigo-400 border-none bg-transparent cursor-pointer transition"
                        >
                          <FiMessageSquare className="w-4 h-4" />
                          <span>{pub.cantComentarios || 0} comentarios</span>
                        </button>

                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => mostrarMensajeTeammate("El guardado de hilos está fuera de los alcances de la US actual.")}
                            className="flex items-center gap-1.5 hover:text-indigo-650 dark:hover:text-indigo-400 border-none bg-transparent cursor-pointer transition"
                          >
                            <FiBookmark className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Guardar</span>
                          </button>
                          <button 
                            onClick={() => mostrarMensajeTeammate("Compartir hilos está fuera de los alcances de la US actual.")}
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
                );
              })}
            </div>
          )}
        </div>

        {/* Lado Derecho: Sidebar de Reglas, Info de la Materia */}
        <div className="space-y-4">
          
          {/* Tarjeta de Información de la Comunidad */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
              Información de la comunidad
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-base font-extrabold shadow-sm shrink-0">
                {getIniciales(materia?.nombre)}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{materia?.nombre}</h4>
                <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-semibold mt-0.5">UTN - {materia?.codigo}</p>
              </div>
            </div>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed">
              Foro oficial para dudas, consultas, opiniones y recursos sobre la materia. Todos los hilos deben estar relacionados estrictamente con fines académicos.
            </p>

            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-500">Publicaciones en el foro</span>
              <span className="font-bold text-zinc-805 dark:text-zinc-200">{publicaciones.length}</span>
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
              <li className="flex gap-2.5 text-xs text-zinc-650 dark:text-zinc-400 leading-normal">
                <span className="w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center font-bold text-zinc-500 text-[10px] shrink-0">3</span>
                <span>Buscá antes de publicar, tu duda puede ya estar respondida.</span>
              </li>
              <li className="flex gap-2.5 text-xs text-zinc-650 dark:text-zinc-400 leading-normal">
                <span className="w-5 h-5 rounded bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center font-bold text-zinc-500 text-[10px] shrink-0">4</span>
                <span>No compartas información personal ni spam.</span>
              </li>
            </ol>
          </div>

          {/* Tarjeta de Etiquetas Populares */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
              Etiquetas populares
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {["Teoremas", "Integrales", "Series", "Límites", "Ejercicios", "Parciales"].map(tag => (
                <button
                  key={tag}
                  onClick={() => mostrarMensajeTeammate("El filtrado por tags corresponde a la US de ordenamiento y filtrado de publicaciones.")}
                  className="px-2.5 py-1 bg-zinc-50 hover:bg-indigo-50 dark:bg-zinc-850 dark:hover:bg-indigo-950/20 text-zinc-600 dark:text-zinc-400 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-lg text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 cursor-pointer transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default MuroForo;
