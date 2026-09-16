import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiBarChart2, 
  FiAlertCircle, 
  FiSearch, 
  FiChevronRight, 
  FiUser, 
  FiExternalLink, 
  FiCalendar, 
  FiBookOpen, 
  FiTrash2, 
  FiFlag,
  FiCheckCircle,
  FiInbox,
  FiRotateCcw
} from "react-icons/fi";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("pendientes"); // "pendientes", "resueltos", "todos"
  const [cargando, setCargando] = useState(true);
  const [errorAcceso, setErrorAcceso] = useState(false);
  const [alerta, setAlerta] = useState(null); // { mensaje, tipo: 'success' | 'error' }
  const navigate = useNavigate();

  // Obtener rol del usuario actual
  let usuarioActual = {};
  try {
    const usuarioStr = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
    if (usuarioStr && usuarioStr !== "undefined") {
      usuarioActual = JSON.parse(usuarioStr);
    }
  } catch (e) {
    console.error("Error parseando usuario:", e);
  }

  const esAdministrador = usuarioActual?.id_tipo_usuario === 3;

  const fetchReportes = async () => {
    if (!esAdministrador) {
      setErrorAcceso(true);
      setCargando(false);
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/publicaciones/reportes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportes(response.data);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      if (error.response?.status === 403) {
        setErrorAcceso(true);
      } else {
        mostrarAlerta("Error al cargar los reportes de publicaciones.", "error");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const mostrarAlerta = (mensaje, tipo = "error") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 4000);
  };

  const handleResolverReporte = async (e, id) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.post(`${apiUrl}/publicaciones/reportes/${id}/resolver`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { reporte, mensaje } = response.data;
      setReportes(prev => prev.map(r => r.id === id ? { ...r, resuelto: reporte.resuelto } : r));
      mostrarAlerta(mensaje, "success");
    } catch (error) {
      console.error("Error al resolver/pendiente del reporte:", error);
      mostrarAlerta("No se pudo actualizar el estado del reporte.", "error");
    }
  };

  const normalizarTexto = (texto) => {
    return texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";
  };

  const reportesFiltrados = reportes.filter((r) => {
    // Filtrar por estado (resuelto / pendiente)
    if (filtroStatus === "pendientes" && r.resuelto) return false;
    if (filtroStatus === "resueltos" && !r.resuelto) return false;

    // Filtrar por término de búsqueda
    const query = normalizarTexto(busqueda);
    if (!query) return true;

    const motivo = normalizarTexto(r.descripcion);
    const pub = r.ForoPublicacion || {};
    const pubTitulo = normalizarTexto(pub.titulo);
    const pubContenido = normalizarTexto(pub.contenido);
    
    const reportadorNombre = r.Reportador ? `${r.Reportador.nombre} ${r.Reportador.apellido} ${r.Reportador.nombre_usuario}` : "";
    const reportadorNormalizado = normalizarTexto(reportadorNombre);

    const comentarioContenido = r.Comentario ? normalizarTexto(r.Comentario.contenido) : "";
    const comentarioAutorNombre = r.Comentario && r.Comentario.Autor 
      ? normalizarTexto(`${r.Comentario.Autor.nombre} ${r.Comentario.Autor.apellido} ${r.Comentario.Autor.nombre_usuario}`)
      : "";

    const autorNombre = r.Comentario && r.Comentario.Autor
      ? `${r.Comentario.Autor.nombre} ${r.Comentario.Autor.apellido} ${r.Comentario.Autor.nombre_usuario}`
      : (pub.Autor ? `${pub.Autor.nombre} ${pub.Autor.apellido} ${pub.Autor.nombre_usuario}` : "");
    const autorNormalizado = normalizarTexto(autorNombre);

    const materiaNombre = pub.Materia?.nombre || "";
    const materiaNormalizada = normalizarTexto(materiaNombre);
    
    return (
      motivo.includes(query) || 
      pubTitulo.includes(query) || 
      pubContenido.includes(query) || 
      comentarioContenido.includes(query) ||
      comentarioAutorNombre.includes(query) ||
      reportadorNormalizado.includes(query) || 
      autorNormalizado.includes(query) ||
      materiaNormalizada.includes(query)
    );
  });

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + " hs";
  };

  const getColoresCategoria = (categoria) => {
    switch (categoria?.toLowerCase()) {
      case "duda":
        return "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450";
      case "opinión":
      case "opinion":
        return "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-450";
      case "recurso":
        return "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450";
      default:
        return "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400";
    }
  };

  const renderMiniAvatar = (usuario, colorGradient = "from-red-500 to-rose-600") => {
    const nombre = usuario?.nombre || "U";
    const apellido = usuario?.apellido || "A";
    const iniciales = `${nombre[0]}${apellido[0]}`.toUpperCase();
    return (
      <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${colorGradient} flex items-center justify-center text-[10px] text-white font-extrabold shrink-0 shadow-sm`}>
        {iniciales}
      </div>
    );
  };

  // Contadores para pestañas
  const cantPendientes = reportes.filter(r => !r.resuelto).length;
  const cantResueltos = reportes.filter(r => r.resuelto).length;

  if (errorAcceso) {
    return (
      <div className="min-h-full flex items-center justify-center py-20 px-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center max-w-md shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-5">
            <FiAlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Acceso Restringido</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-2 leading-relaxed">
            Esta sección solo está disponible para usuarios con privilegios de administrador.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-5 py-2.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold border-none cursor-pointer transition"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-10">
      
      {/* Toast Alert */}
      {alerta && (
        <div className={`fixed top-20 right-6 left-6 md:left-auto md:w-96 z-50 p-4 rounded-xl shadow-lg flex items-start gap-2.5 animate-in fade-in slide-in-from-top-4 ${
          alerta.tipo === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-350"
            : "bg-red-50 dark:bg-red-950/90 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-300"
        }`}>
          <FiAlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${alerta.tipo === "success" ? "text-emerald-600 dark:text-emerald-500" : "text-red-650 dark:text-red-500"}`} />
          <div>
            <p className="text-xs font-bold">{alerta.tipo === "success" ? "Éxito" : "Notificación"}</p>
            <p className="text-[11px] mt-0.5 leading-relaxed">{alerta.mensaje}</p>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-4 select-none">
        <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition" onClick={() => navigate("/dashboard")}>Inicio</span>
        <FiChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition" onClick={() => navigate("/foros")}>Foros</span>
        <FiChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Reportes</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FiFlag className="w-6 h-6 text-red-500" />
            Reportes de Publicaciones
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1">
            Revisión y moderación de contenido marcado por los estudiantes en los foros.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-80 shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por motivo, título, usuario..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition text-zinc-800 dark:text-zinc-200 shadow-sm"
          />
        </div>
      </div>

      {/* Tabs de Filtro de Estado */}
      <div className="flex items-center gap-2.5 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-px">
        <button
          onClick={() => setFiltroStatus("pendientes")}
          className={`pb-3 text-xs font-bold border-b-2 bg-transparent cursor-pointer transition flex items-center gap-2 px-1 ${
            filtroStatus === "pendientes"
              ? "border-red-500 text-red-500 font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
        >
          <FiInbox className="w-4 h-4" />
          <span>Pendientes</span>
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
            filtroStatus === "pendientes"
              ? "bg-red-50 text-red-500 dark:bg-red-950/40"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-450"
          }`}>
            {cantPendientes}
          </span>
        </button>
        
        <button
          onClick={() => setFiltroStatus("resueltos")}
          className={`pb-3 text-xs font-bold border-b-2 bg-transparent cursor-pointer transition flex items-center gap-2 px-1 ${
            filtroStatus === "resueltos"
              ? "border-emerald-500 text-emerald-500 font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
        >
          <FiCheckCircle className="w-4 h-4" />
          <span>Resueltos</span>
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
            filtroStatus === "resueltos"
              ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-450"
          }`}>
            {cantResueltos}
          </span>
        </button>

        <button
          onClick={() => setFiltroStatus("todos")}
          className={`pb-3 text-xs font-bold border-b-2 bg-transparent cursor-pointer transition flex items-center gap-2 px-1 ${
            filtroStatus === "todos"
              ? "border-indigo-500 text-indigo-500 font-black"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
        >
          <span>Todos los Reportes</span>
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
            filtroStatus === "todos"
              ? "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-450"
          }`}>
            {reportes.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {cargando ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              </div>
              <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : reportesFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <FiFlag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            {busqueda 
              ? "No se encontraron reportes" 
              : filtroStatus === "pendientes" 
                ? "No hay reportes pendientes de revisión"
                : filtroStatus === "resueltos"
                  ? "Aún no tienes reportes marcados como resueltos"
                  : "No hay reportes registrados"}
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium max-w-sm mx-auto mt-2 leading-relaxed">
            {busqueda 
              ? "Prueba refinando los términos de búsqueda o borrando el filtro actual."
              : filtroStatus === "pendientes"
                ? "¡Buen trabajo! Todo el contenido reportado ha sido revisado y solucionado."
                : "Los reportes resueltos se guardarán aquí para referencia futura."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reportesFiltrados.map((rep) => {
            const pub = rep.ForoPublicacion || {};
            const materiaNombre = pub.Materia?.nombre || "Foro";
            const reportadorNombre = rep.Reportador 
              ? `${rep.Reportador.nombre} ${rep.Reportador.apellido}` 
              : "Usuario Anónimo";
            const autorNombre = rep.Comentario && rep.Comentario.Autor
              ? `${rep.Comentario.Autor.nombre} ${rep.Comentario.Autor.apellido}`
              : (pub.Autor ? `${pub.Autor.nombre} ${pub.Autor.apellido}` : "Usuario Anónimo");
            const autorUsuario = rep.Comentario && rep.Comentario.Autor
              ? rep.Comentario.Autor.nombre_usuario
              : (pub.Autor ? pub.Autor.nombre_usuario : "");
            
            return (
              <div
                key={rep.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800/80 rounded-2xl p-5 hover:shadow-md transition duration-350 relative overflow-hidden group flex flex-col gap-4"
              >
                {/* Accent line on left (red for pending, green for resolved) */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${rep.resuelto ? "bg-emerald-500" : "bg-red-500"}`} />

                {/* Top section: users involved & status badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-zinc-100 dark:border-zinc-850 pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-650 dark:text-zinc-350 px-2 py-0.5 rounded-full font-bold">
                      {renderMiniAvatar(rep.Reportador, "from-red-500 to-rose-600")}
                      <span>Reportador: {reportadorNombre} (@{rep.Reportador?.nombre_usuario})</span>
                    </div>
                    <FiChevronRight className="hidden sm:block text-zinc-400" />
                    <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-650 dark:text-zinc-350 px-2 py-0.5 rounded-full font-bold">
                      {renderMiniAvatar(rep.Comentario ? rep.Comentario.Autor : pub.Autor, "from-indigo-500 to-blue-600")}
                      <span>Reportado: {autorNombre} {autorUsuario ? `(@${autorUsuario})` : ""}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase ${
                      rep.resuelto 
                        ? "bg-emerald-50 border border-emerald-250 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30" 
                        : "bg-red-50 border border-red-250 text-red-600 dark:bg-red-950/20 dark:border-red-900/30"
                    }`}>
                      {rep.resuelto ? "Resuelto" : "Pendiente"}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5" />
                      {formatearFecha(rep.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Middle section: report reason */}
                <div className={`border rounded-xl p-3.5 ${
                  rep.resuelto 
                    ? "bg-zinc-50/50 dark:bg-zinc-850/20 border-zinc-150 dark:border-zinc-800/50" 
                    : "bg-red-50/30 dark:bg-red-950/5 border-red-100 dark:border-red-900/10"
                }`}>
                  <h4 className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${
                    rep.resuelto ? "text-zinc-550 dark:text-zinc-400" : "text-red-500"
                  }`}>
                    <FiAlertCircle className="w-4 h-4 shrink-0" />
                    Motivo del Reporte:
                  </h4>
                  <p className={`text-xs font-bold leading-relaxed whitespace-pre-wrap ${
                    rep.resuelto ? "text-zinc-500 dark:text-zinc-400 line-through" : "text-zinc-850 dark:text-zinc-200"
                  }`}>
                    "{rep.descripcion}"
                  </p>
                </div>

                {/* Bottom section: publication snippet or comment snippet */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 border rounded uppercase tracking-wider ${
                      rep.Comentario ? "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-450" : getColoresCategoria(pub.categoria)
                    }`}>
                      {rep.Comentario ? "Comentario" : (pub.categoria || "General")}
                    </span>
                    <span className="text-[9px] bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded font-bold">
                      {materiaNombre}
                    </span>
                  </div>
                  {rep.Comentario ? (
                    <>
                      <div className="text-xs bg-zinc-50 dark:bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-800/20 text-zinc-700 dark:text-zinc-350 italic">
                        "{rep.Comentario.contenido}"
                      </div>
                      <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">
                        En la publicación: <span className="underline">{pub.titulo || "Publicación sin título"}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                        {pub.titulo || "Publicación sin título"}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-450 line-clamp-2 leading-relaxed">
                        {pub.contenido || "Sin contenido."}
                      </p>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850 pt-3">
                  {/* Resolve/reopen button */}
                  <button
                    onClick={(e) => handleResolverReporte(e, rep.id)}
                    className={`px-4.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition flex items-center gap-1.5 ${
                      rep.resuelto
                        ? "bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750"
                        : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-650 dark:text-emerald-450 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/40 shadow-sm"
                    }`}
                  >
                    {rep.resuelto ? (
                      <>
                        <FiRotateCcw className="w-3.5 h-3.5" />
                        <span>Marcar como Pendiente</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        <span>Resolver Reporte</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`/foros/${pub.id_materia}/publicacion/${pub.id}`)}
                    className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition flex items-center gap-1.5 shadow-sm shadow-indigo-500/10"
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                    Ir a la Publicación
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reportes;
