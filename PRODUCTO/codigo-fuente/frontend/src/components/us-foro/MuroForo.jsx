import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  FiAlertCircle,
  FiFlag
} from "react-icons/fi";

const MuroForo = () => {
  const { materiaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [datosForo, setDatosForo] = useState({ materia: {}, publicaciones: [] });
  const [cargando, setCargando] = useState(true);
  const [vistaActual, setVistaActual] = useState('muro'); //sino crear
  
  // Para mostrar alertas de funcionalidad deshabilitada correspondiente a otras US
  const [alertaTeammate, setAlertaTeammate] = useState(null);

  // Estados para reporte de publicaciones
  const [modalReportarAbierto, setModalReportarAbierto] = useState(false);
  const [pubIdAReportar, setPubIdAReportar] = useState(null);
  const [descripcionReporte, setDescripcionReporte] = useState("");
  const [errorReporte, setErrorReporte] = useState("");

  // Estados para pestaña de Mis Publicaciones/Comentarios
  const [subTabActiva, setSubTabActiva] = useState("todo"); // "todo" o "mis-publicaciones"
  const [misAportes, setMisAportes] = useState({ publicaciones: [], comentarios: [] });
  const [cargandoMisAportes, setCargandoMisAportes] = useState(false);

  // Estados para filtro por etiquetas
  const [etiquetasForum, setEtiquetasForum] = useState([]);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState(null);
  const [buscadorTags, setBuscadorTags] = useState("");
  const [dropdownTagsAbierto, setDropdownTagsAbierto] = useState(false);

  const fetchMisAportes = async () => {
    setCargandoMisAportes(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/foro/materias/${materiaId}/mis-aportes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMisAportes(response.data);
    } catch (error) {
      console.error("Error al obtener mis aportes:", error);
    } finally {
      setCargandoMisAportes(false);
    }
  };

  const fetchEtiquetas = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/foro/materias/${materiaId}/etiquetas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEtiquetasForum(response.data);
    } catch (error) {
      console.error("Error al obtener etiquetas del foro:", error);
    }
  };

  useEffect(() => {
    if (subTabActiva === "mis-publicaciones") {
      fetchMisAportes();
    }
  }, [subTabActiva, materiaId]);

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
    fetchEtiquetas();
    
    if (location.state && location.state.tagFiltrado) {
      setEtiquetaSeleccionada(location.state.tagFiltrado);
      window.history.replaceState(null, '');
    } else {
      setEtiquetaSeleccionada(null);
    }
    setBuscadorTags("");
    setDropdownTagsAbierto(false);
  }, [materiaId, location.state]);

  
  const reorganizarPublicaciones = async (filtro) => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/foro/materias/${materiaId}/publicaciones`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { orden: filtro }
      });
      setDatosForo(response.data);
    } catch (error) {
      console.error("Error al cargar foro de materia:", error);
    } finally {
      setCargando(false);
    }
  };

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
    const difDias = Math.floor(difMs / (1000 * 60 * 24));

    if (difMins < 60) return `hace ${Math.max(1, difMins)} min`;
    if (difHoras < 24) return `hace ${difHoras} horas`;
    return `hace ${difDias} días`;
  };

  const handleReaccionarMuro = async (pubId, tipo) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await axios.post(`${apiUrl}/publicaciones/${pubId}/reaccionar`, { tipo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDatosForo(prev => ({
        ...prev,
        publicaciones: prev.publicaciones.map(p => 
          p.id === pubId ? { ...p, votos: res.data.votos } : p
        )
      }));
    } catch (error) {
      console.error("Error al reaccionar en muro:", error);
      mostrarMensajeTeammate(error.response?.data?.error || "Error al registrar voto.");
    }
  };

  const handleGuardarPublicacion = async (pubId) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.post(`${apiUrl}/publicaciones/${pubId}/guardar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDatosForo(prev => ({
        ...prev,
        publicaciones: prev.publicaciones.map(p => 
          p.id === pubId ? { ...p, esGuardada: response.data.guardada } : p
        )
      }));

      mostrarMensajeTeammate(response.data.mensaje);
    } catch (error) {
      console.error("Error al guardar/desguardar publicación:", error);
      mostrarMensajeTeammate("Error al procesar la solicitud de guardado.");
    }
  };

  const abrirModalReportar = (pubId) => {
    setPubIdAReportar(pubId);
    setDescripcionReporte("");
    setErrorReporte("");
    setModalReportarAbierto(true);
  };

  const cerrarModalReportar = () => {
    setModalReportarAbierto(false);
    setPubIdAReportar(null);
    setDescripcionReporte("");
    setErrorReporte("");
  };

  const enviarReporte = async () => {
    if (!descripcionReporte.trim()) {
      setErrorReporte("El motivo del reporte es obligatorio.");
      return;
    }
    if (descripcionReporte.trim().length < 5) {
      setErrorReporte("El motivo del reporte debe tener al menos 5 caracteres.");
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      await axios.post(`${apiUrl}/publicaciones/${pubIdAReportar}/reportar`, {
        descripcion: descripcionReporte
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      mostrarMensajeTeammate("Reporte enviado a los administradores con éxito.");
      cerrarModalReportar();
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      mostrarMensajeTeammate(error.response?.data?.error || "Error al enviar el reporte.");
    }
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
      fetchEtiquetas();
      if (subTabActiva === "mis-publicaciones") {
        fetchMisAportes();
      }
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

  const publicacionesFiltradas = etiquetaSeleccionada
    ? publicaciones.filter(pub => 
        pub.Etiquetas && pub.Etiquetas.some(tag => tag.nombre.toLowerCase() === etiquetaSeleccionada.toLowerCase())
      )
    : publicaciones;

  const misPublicacionesFiltradas = etiquetaSeleccionada
    ? misAportes.publicaciones.filter(pub => 
        pub.Etiquetas && pub.Etiquetas.some(tag => tag.nombre.toLowerCase() === etiquetaSeleccionada.toLowerCase())
      )
    : misAportes.publicaciones;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Alerta de US Deshabilitada u otros avisos */}
      {alertaTeammate && (
        <div className="fixed top-20 right-6 left-6 md:left-auto md:w-96 z-50 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-250 dark:border-indigo-900 text-indigo-900 dark:text-indigo-300 p-4 rounded-xl shadow-lg flex items-start gap-2.5 animate-in fade-in slide-in-from-top-4">
          <FiAlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold">Aviso del Sistema</p>
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <FiPlus className="w-4 h-4 shrink-0" />
              <span>Crear publicación</span>
            </button>
          </div>

          {/* Panel de Filtro de Etiquetas */}
          <div className="flex flex-wrap gap-2 items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-zinc-550 dark:text-zinc-400 shrink-0">Filtrar por etiqueta:</span>
              
              {/* Desplegable personalizado para Etiquetas con Buscador y Scroll */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownTagsAbierto(!dropdownTagsAbierto)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition flex items-center gap-1.5 select-none cursor-pointer"
                >
                  <span className={etiquetaSeleccionada ? "text-indigo-655 dark:text-indigo-400 font-bold" : ""}>
                    {etiquetaSeleccionada || "Todas las etiquetas"}
                  </span>
                  <span className="text-[10px] text-zinc-400">▼</span>
                </button>

                {dropdownTagsAbierto && (
                  <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-30 p-2 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Campo de búsqueda dentro del desplegable */}
                    <input
                      type="text"
                      placeholder="Buscar etiqueta..."
                      value={buscadorTags}
                      onChange={(e) => setBuscadorTags(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-zinc-150 dark:border-zinc-850 rounded-xl text-xs outline-none focus:border-indigo-500 bg-zinc-50/50 dark:bg-zinc-950/50"
                    />

                    {/* Contenedor de scroll con las etiquetas */}
                    <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-zinc-200">
                      <button
                        type="button"
                        onClick={() => {
                          setEtiquetaSeleccionada(null);
                          setDropdownTagsAbierto(false);
                          setBuscadorTags("");
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                          !etiquetaSeleccionada 
                            ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-bold" 
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-350"
                        }`}
                      >
                        Todas las etiquetas
                      </button>

                      {etiquetasForum
                        .filter(tag => tag.toLowerCase().includes(buscadorTags.toLowerCase()))
                        .map((tag) => {
                          const estaSeleccionada = etiquetaSeleccionada === tag;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setEtiquetaSeleccionada(tag);
                                setDropdownTagsAbierto(false);
                                setBuscadorTags("");
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer truncate ${
                                estaSeleccionada 
                                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-bold" 
                                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-650 dark:text-zinc-350"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      
                      {etiquetasForum.filter(tag => tag.toLowerCase().includes(buscadorTags.toLowerCase())).length === 0 && (
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center py-2">
                          No se encontraron etiquetas
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Indicador de filtro activo con botón de limpiar */}
            {etiquetaSeleccionada && (
              <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-955/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-xl text-xs font-bold animate-in zoom-in-95">
                <span>Filtrando por: {etiquetaSeleccionada}</span>
                <button
                  type="button"
                  onClick={() => setEtiquetaSeleccionada(null)}
                  className="hover:text-indigo-800 dark:hover:text-indigo-300 font-extrabold ml-1 cursor-pointer focus:outline-none text-[11px]"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* Pestañas de Vista y Orden (UI Shell) */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold overflow-x-auto whitespace-nowrap scrollbar-none min-w-0">
              <button 
                onClick={() => setSubTabActiva("todo")}
                className={`pb-2 border-b-2 bg-transparent cursor-pointer shrink-0 transition ${
                  subTabActiva === "todo"
                    ? "border-indigo-650 text-indigo-650 dark:border-indigo-400 dark:text-indigo-400 font-extrabold"
                    : "border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-650"
                }`}
              >
                Publicaciones
              </button>
              <button 
                onClick={() => setSubTabActiva("mis-publicaciones")}
                className={`pb-2 border-b-2 bg-transparent cursor-pointer shrink-0 transition ${
                  subTabActiva === "mis-publicaciones"
                    ? "border-indigo-650 text-indigo-650 dark:border-indigo-400 dark:text-indigo-400 font-extrabold"
                    : "border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-650"
                }`}
              >
                Mis publicaciones
              </button>
              <button 
                onClick={() => reorganizarPublicaciones("recientes")}
                className="pb-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-355 border-none bg-transparent cursor-pointer transition shrink-0"
              >
                Más recientes
              </button>
              <button 
                onClick={() => reorganizarPublicaciones("votos")}
                className="pb-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-355 border-none bg-transparent cursor-pointer transition shrink-0"
              >
                Más votadas
              </button>
            </div>
            <div className="text-xs shrink-0">
              <button
                onClick={() => reorganizarPublicaciones("votos")}
                className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 font-semibold flex items-center gap-1 transition"
              >
                Ordenar por: <span className="text-indigo-600 dark:text-indigo-400">Relevancia</span>
              </button>
            </div>
          </div>

          {/* Listado Real de Publicaciones */}
          {subTabActiva === "todo" ? (
            cargando ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="animate-spin text-2xl text-indigo-655">⌛</span>
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
            ) : publicacionesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 mb-3">
                  <FiMessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 text-center">Sin resultados</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 max-w-sm mt-1 text-center">
                  No encontramos aportes con la etiqueta <span className="font-bold text-indigo-600 dark:text-indigo-400">{etiquetaSeleccionada}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setEtiquetaSeleccionada(null)}
                  className="mt-3 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Quitar filtro de etiqueta
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {publicacionesFiltradas.map((pub) => {
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
                          onClick={() => handleReaccionarMuro(pub.id, 'positivo')}
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent text-zinc-400 hover:text-amber-500 transition"
                        >
                          <FiArrowUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold">{pub.votos || 0}</span>
                        <button 
                          onClick={() => handleReaccionarMuro(pub.id, 'negativo')}
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent text-zinc-400 hover:text-indigo-500 transition"
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
                            <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-none mt-0.5">
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
                            className="text-left font-bold text-zinc-855 dark:text-zinc-50 hover:text-indigo-650 dark:hover:text-indigo-400 text-sm md:text-base leading-tight block w-full p-0 border-none bg-transparent cursor-pointer transition mb-1.5"
                          >
                            {pub.titulo}
                          </button>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {pub.contenido}
                          </p>
                          {/* Etiquetas de la publicación */}
                          {pub.Etiquetas && pub.Etiquetas.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pub.Etiquetas.map((tag) => (
                                <button 
                                  key={tag.id || tag.nombre} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEtiquetaSeleccionada(tag.nombre);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="text-[9px] bg-zinc-100 hover:bg-indigo-50 dark:bg-zinc-800/80 dark:hover:bg-indigo-950/30 text-zinc-600 hover:text-indigo-650 dark:text-zinc-400 dark:hover:text-indigo-400 px-2 py-0.5 rounded-full font-semibold transition border-none cursor-pointer"
                                >
                                  {tag.nombre}
                                </button>
                              ))}
                            </div>
                          )}
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
                              onClick={() => handleGuardarPublicacion(pub.id)}
                              className={`flex items-center gap-1.5 border-none bg-transparent cursor-pointer transition ${
                                pub.esGuardada
                                  ? "text-indigo-650 dark:text-indigo-400 font-extrabold"
                                  : "hover:text-indigo-650 dark:hover:text-indigo-400"
                              }`}
                            >
                              <FiBookmark className={`w-3.5 h-3.5 ${pub.esGuardada ? "fill-current" : ""}`} />
                              <span className="hidden sm:inline">{pub.esGuardada ? "Guardada" : "Guardar"}</span>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModalReportar(pub.id);
                              }}
                              className="flex items-center gap-1.5 hover:text-red-655 dark:hover:text-red-400 border-none bg-transparent cursor-pointer transition"
                            >
                              <FiAlertCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reportar</span>
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
            )
          ) : (
            cargandoMisAportes ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="animate-spin text-2xl text-indigo-655">⌛</span>
                <p className="text-sm text-zinc-500 dark:text-zinc-450">Cargando tus aportes...</p>
              </div>
            ) : (misAportes.publicaciones.length === 0 && misAportes.comentarios.length === 0) ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 mb-3 animate-bounce">
                  <FiFlag className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-855 dark:text-zinc-200 text-center">Sin publicaciones ni comentarios</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 max-w-sm mt-1 text-center">
                  Aún no has creado publicaciones ni comentarios en este foro. ¡Anímate a participar!
                </p>
              </div>
            ) : (etiquetaSeleccionada && misPublicacionesFiltradas.length === 0) ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 mb-3">
                  <FiMessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 text-center">Sin resultados</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 max-w-sm mt-1 text-center">
                  Ninguna de tus publicaciones tiene la etiqueta <span className="font-bold text-indigo-600 dark:text-indigo-400">{etiquetaSeleccionada}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setEtiquetaSeleccionada(null)}
                  className="mt-3 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Quitar filtro de etiqueta
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Publicaciones creadas por mí */}
                {misPublicacionesFiltradas.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-655 dark:text-indigo-400 flex items-center gap-1.5 px-1">
                      <FiMessageSquare className="w-4 h-4" />
                      {`Tus publicaciones (${misPublicacionesFiltradas.length})`}
                    </h3>
                    <div className="space-y-3">
                      {misPublicacionesFiltradas.map((pub) => {
                        const nombreCompleto = pub.Autor ? `${pub.Autor.nombre} ${pub.Autor.apellido}` : "Usuario Anónimo";
                        const iniciales = pub.Autor ? `${pub.Autor.nombre[0]}${pub.Autor.apellido[0]}`.toUpperCase() : "US";
                        const esDocente = pub.Autor?.id_tipo_usuario === 2;

                        return (
                          <div 
                            key={pub.id}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex gap-4 transition shadow-sm hover:shadow-md hover:border-indigo-500/20"
                          >
                            {/* Flechas de Votos */}
                            <div className="flex flex-col items-center justify-start gap-1 text-zinc-450 shrink-0">
                              <button 
                                onClick={() => handleReaccionarMuro(pub.id, 'positivo')}
                                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent text-zinc-400 hover:text-amber-500 transition"
                              >
                                <FiArrowUp className="w-4 h-4" />
                              </button>
                              <span className="text-xs font-bold">{pub.votos || 0}</span>
                              <button 
                                onClick={() => handleReaccionarMuro(pub.id, 'negativo')}
                                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border-none bg-transparent text-zinc-400 hover:text-indigo-500 transition"
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
                                        ? 'bg-emerald-100 dark:bg-emerald-955 text-emerald-800 dark:text-emerald-350' 
                                        : 'bg-indigo-50 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350'
                                    }`}>
                                      {esDocente ? 'Docente' : 'Estudiante'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-none mt-0.5">
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
                                  className="text-left font-bold text-zinc-855 dark:text-zinc-50 hover:text-indigo-650 dark:hover:text-indigo-400 text-sm md:text-base leading-tight block w-full p-0 border-none bg-transparent cursor-pointer transition mb-1.5"
                                >
                                  {pub.titulo}
                                </button>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                  {pub.contenido}
                                </p>
                                {/* Etiquetas de la publicación */}
                                {pub.Etiquetas && pub.Etiquetas.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {pub.Etiquetas.map((tag) => (
                                      <button 
                                        key={tag.id || tag.nombre} 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEtiquetaSeleccionada(tag.nombre);
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="text-[9px] bg-zinc-100 hover:bg-indigo-50 dark:bg-zinc-800/80 dark:hover:bg-indigo-950/30 text-zinc-600 hover:text-indigo-655 dark:text-zinc-400 dark:hover:text-indigo-400 px-2 py-0.5 rounded-full font-semibold transition border-none cursor-pointer"
                                      >
                                        {tag.nombre}
                                      </button>
                                    ))}
                                  </div>
                                )}
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
                                    onClick={() => handleGuardarPublicacion(pub.id)}
                                    className={`flex items-center gap-1.5 border-none bg-transparent cursor-pointer transition ${
                                      pub.esGuardada
                                        ? "text-indigo-650 dark:text-indigo-455 font-extrabold"
                                        : "hover:text-indigo-655 dark:hover:text-indigo-400"
                                    }`}
                                  >
                                    <FiBookmark className={`w-3.5 h-3.5 ${pub.esGuardada ? "fill-current" : ""}`} />
                                    <span className="hidden sm:inline">{pub.esGuardada ? "Guardada" : "Guardar"}</span>
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      abrirModalReportar(pub.id);
                                    }}
                                    className="flex items-center gap-1.5 hover:text-red-655 dark:hover:text-red-400 border-none bg-transparent cursor-pointer transition"
                                  >
                                    <FiAlertCircle className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Reportar</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Comentarios realizados por mí */}
                {misAportes.comentarios.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5 px-1">
                      <FiMessageCircle className="w-4 h-4" />
                      {`Tus comentarios (${misAportes.comentarios.length})`}
                    </h3>
                    <div className="space-y-3">
                      {misAportes.comentarios.map((com) => (
                        <div 
                          key={com.id} 
                          onClick={() => navigate(`/foros/${materiaId}/publicacion/${com.ForoPublicacion?.id}`)}
                          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-2.5 transition shadow-sm hover:shadow-md hover:border-indigo-500/20 cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[9px] text-zinc-450 dark:text-zinc-500 font-extrabold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><FiMessageCircle className="w-3 h-3 text-indigo-500" /> Comentario redactado por ti</span>
                            <span>{formatearFecha(com.createdAt)}</span>
                          </div>
                          <div className="text-xs font-black text-zinc-850 dark:text-zinc-200">
                            Publicación: <span className="text-indigo-600 dark:text-indigo-400 hover:underline">{com.ForoPublicacion?.titulo || "Sin título"}</span>
                            <span className="text-[10px] text-zinc-405 font-medium lowercase block mt-0.5">
                              {`Publicado por @${com.ForoPublicacion?.Autor?.nombre_usuario || "anonimo"}`}
                            </span>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 p-3 rounded-xl text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-bold border-l-2 border-l-indigo-550">
                            {`"${com.contenido}"`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
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

      {/* Modal de Reportar */}
      {modalReportarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-red-500" />
                Reportar Publicación
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Por favor, describe detalladamente el motivo por el cual estás reportando esta publicación. Un administrador revisará tu reporte.
              </p>
            </div>
            
            <textarea
              value={descripcionReporte}
              onChange={(e) => {
                setDescripcionReporte(e.target.value);
                setErrorReporte("");
              }}
              placeholder="Escribe el motivo del reporte aquí (obligatorio)..."
              rows={4}
              className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition text-zinc-850 dark:text-zinc-100"
            />
            
            {errorReporte && (
              <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errorReporte}
              </p>
            )}
            
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={cerrarModalReportar}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-650 dark:text-zinc-300 rounded-xl text-xs font-bold border-none cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                onClick={enviarReporte}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition shadow-md shadow-red-500/10"
              >
                Enviar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuroForo;
