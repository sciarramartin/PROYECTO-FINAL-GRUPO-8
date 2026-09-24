import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiSearch, 
  FiMessageSquare, 
  FiBookmark, 
  FiShare2, 
  FiArrowUp, 
  FiArrowDown, 
  FiTrendingUp, 
  FiClock, 
  FiChevronRight, 
  FiBookOpen, 
  FiAward, 
  FiFilter
} from "react-icons/fi";
import CompartirPublicacion from "./CompartirPublicacion";

const ListaForos = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // Estados de Materias (Sidebar Derecho)
  const [materias, setMaterias] = useState([]);
  const [busquedaMateria, setBusquedaMateria] = useState("");
  const [cargandoMaterias, setCargandoMaterias] = useState(true);

  // Estados de Feed Global (Centro)
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargandoFeed, setCargandoFeed] = useState(true);
  const [busquedaFeed, setBusquedaFeed] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [orden, setOrden] = useState("votos"); // "votos" | "reciente"
  const [paginaOffset, setPaginaOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalFeed, setTotalFeed] = useState(0);
  const [mensajeToast, setMensajeToast] = useState("");

  // Modal Compartir
  const [compartirData, setCompartirData] = useState({ isOpen: false, post: null });

  const categorias = ["Todas", "Duda", "Aporte", "Debate", "Recurso", "Opinión"];

  // 1. Cargar catálogo de materias (para barra derecha y selector)
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await axios.get(`${apiUrl}/foro/materias`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMaterias(response.data || []);
      } catch (error) {
        console.error("Error al cargar materias del foro:", error);
      } finally {
        setCargandoMaterias(false);
      }
    };
    if (token) fetchMaterias();
  }, [token]);

  // 2. Cargar feed central (resetea si cambian filtros)
  const cargarFeed = async (reiniciar = false) => {
    setCargandoFeed(true);
    const offsetActual = reiniciar ? 0 : publicaciones.length;
    try {
      const params = {
        limit: 8,
        offset: offsetActual,
        orden: orden,
        categoria: categoriaSeleccionada !== "Todas" ? categoriaSeleccionada : undefined,
        busqueda: busquedaFeed.trim() || undefined
      };

      const response = await axios.get(`${apiUrl}/foro/feed`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const nuevasPubs = response.data.publicaciones || [];
      if (reiniciar) {
        setPublicaciones(nuevasPubs);
      } else {
        setPublicaciones(prev => [...prev, ...nuevasPubs]);
      }
      setHasMore(response.data.hasMore);
      setTotalFeed(response.data.total || 0);
    } catch (error) {
      console.error("Error al cargar feed:", error);
    } finally {
      setCargandoFeed(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarFeed(true);
    }
  }, [token, orden, categoriaSeleccionada]);

  const handleBuscarFeed = (e) => {
    e.preventDefault();
    cargarFeed(true);
  };

  // Reaccionar (+1 / -1 voto)
  const handleReaccionar = async (pubId, tipo) => {
    try {
      const response = await axios.post(
        `${apiUrl}/publicaciones/${pubId}/reaccionar`,
        { tipo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPublicaciones(prev =>
        prev.map(p => (p.id === pubId ? { ...p, votos: response.data.votos } : p))
      );
    } catch (error) {
      console.error("Error al reaccionar:", error);
    }
  };

  // Guardar publicación
  const handleGuardar = async (pubId) => {
    try {
      const response = await axios.post(
        `${apiUrl}/publicaciones/${pubId}/guardar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPublicaciones(prev =>
        prev.map(p => (p.id === pubId ? { ...p, esGuardada: response.data.guardada } : p))
      );
      setMensajeToast(response.data.mensaje);
      setTimeout(() => setMensajeToast(""), 3500);
    } catch (error) {
      console.error("Error al guardar publicación:", error);
    }
  };

  // Paleta de colores para iniciales de materias
  const getColoresCirculo = (id) => {
    const paletas = [
      { bg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300" },
      { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
      { bg: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
      { bg: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300" },
      { bg: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
      { bg: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300" }
    ];
    return paletas[(id || 0) % paletas.length];
  };

  const getIniciales = (nombre = "") => {
    const palabras = nombre.split(" ").filter(Boolean);
    if (palabras.length >= 2) {
      const p1 = palabras[0].charAt(0);
      const p2 = palabras[1].toLowerCase() === "y" && palabras[2] ? palabras[2].charAt(0) : palabras[1].charAt(0);
      return (p1 + p2).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase() || "FO";
  };

  const normalizarTexto = (texto) =>
    texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  const materiasFiltradas = materias.filter((m) => {
    const q = normalizarTexto(busquedaMateria);
    return normalizarTexto(m.nombre).includes(q) || normalizarTexto(m.codigo).includes(q);
  });

  const getBadgeCategoria = (cat) => {
    switch (cat) {
      case "Duda":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "Aporte":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Recurso":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      case "Debate":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "Opinión":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      
      {/* Toast de confirmación */}
      {mensajeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-fade-in">
          <span>✓</span>
          <span>{mensajeToast}</span>
        </div>
      )}

      {/* Modal Compartir */}
      {compartirData.isOpen && compartirData.post && (
        <CompartirPublicacion
          isOpen={compartirData.isOpen}
          onClose={() => setCompartirData({ isOpen: false, post: null })}
          publicacionData={compartirData.post}
        />
      )}

      {/* Grid Principal de 2 Columnas (Feed a la izquierda, Materias más ancha a la derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================================= */}
        {/* COLUMNA CENTRAL: FEED DE PUBLICACIONES (lg:col-span-7)                    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Banner del Feed */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 rounded-3xl p-6 text-white shadow-md relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Ícono de Información con Tooltip en la esquina superior derecha */}
            <div className="absolute top-5 right-5 z-20">
              <span className="relative inline-flex items-center group cursor-pointer select-none">
                <span
                  aria-label="Información sobre el feed del foro"
                  className="w-5 h-5 rounded-full border border-indigo-300/60 text-indigo-200 hover:text-white hover:border-white flex items-center justify-center text-[10px] font-black transition-all group-hover:scale-110 bg-indigo-950/40"
                >
                  !
                </span>
                <span className="pointer-events-none absolute top-full right-0 mt-2 w-72 p-3.5 bg-zinc-900/95 text-white text-xs leading-relaxed rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 border border-zinc-700 font-normal normal-case text-left backdrop-blur-sm">
                  <span className="font-bold text-amber-300 block mb-1">
                    💡 Dinámica del Feed
                  </span>
                  <p className="text-zinc-200 mb-1.5 text-[11px] leading-relaxed">
                    En este feed se muestran las <strong>publicaciones más relevantes de todas las materias</strong>.
                  </p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    En caso de querer ir a una materia específica, buscá en la sección <strong>"Foros por Materia"</strong> a la derecha.
                  </p>
                  <span className="absolute bottom-full right-1.5 -mb-1 border-4 border-transparent border-b-zinc-900"></span>
                </span>
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">💬</span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Comunidad Universitaria • UTN FRC
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Foro Académico
              </h1>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros de Categoría */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            
            {/* Buscador de posts */}
            <form onSubmit={handleBuscarFeed} className="relative flex items-center">
              <FiSearch className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={busquedaFeed}
                onChange={(e) => setBusquedaFeed(e.target.value)}
                placeholder="Buscar por título, temas o contenidos del foro..."
                className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none transition text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition border-none cursor-pointer"
              >
                Buscar
              </button>
            </form>

            {/* Fila de Filtros y Orden */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              
              {/* Categorías (Pills) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaSeleccionada(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                      categoriaSeleccionada === cat
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Orden: Más votadas / Recientes */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setOrden("votos")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition border-none cursor-pointer ${
                    orden === "votos"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 bg-transparent"
                  }`}
                >
                  <FiTrendingUp className="w-3.5 h-3.5" />
                  <span>Más votadas</span>
                </button>
                <button
                  onClick={() => setOrden("reciente")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition border-none cursor-pointer ${
                    orden === "reciente"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 bg-transparent"
                  }`}
                >
                  <FiClock className="w-3.5 h-3.5" />
                  <span>Recientes</span>
                </button>
              </div>

            </div>
          </div>

          {/* Listado de Tarjetas del Feed */}
          {cargandoFeed && publicaciones.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Cargando publicaciones del feed...</p>
            </div>
          ) : publicaciones.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mx-auto">
                🔍
              </div>
              <h3 className="text-sm font-bold text-slate-800">No se encontraron publicaciones</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No hay publicaciones que coincidan con los filtros o el término de búsqueda actual.
              </p>
              <button
                onClick={() => {
                  setBusquedaFeed("");
                  setCategoriaSeleccionada("Todas");
                  cargarFeed(true);
                }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition border-none cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {publicaciones.map((pub) => {
                const materiaObj = pub.Materia || pub.materium || materias.find((m) => m.id === pub.id_materia) || {};
                const autorNombre = pub.Autor ? `${pub.Autor.nombre} ${pub.Autor.apellido}`.trim() : "Estudiante UTN";
                const autorUsername = pub.Autor?.nombre_usuario || "usuario";
                const materiaNombre = materiaObj.nombre || "Materia";
                const materiaCodigo = materiaObj.codigo || "";
                const materiaNivel = materiaObj.nivel_anio ? `${materiaObj.nivel_anio}° Año` : "";
                const fechaFormat = new Date(pub.createdAt).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "short"
                });

                return (
                  <article
                    key={pub.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex gap-4">
                      
                      {/* Votador Lateral Vertical (Estilo Reddit / StackOverflow) */}
                      <div className="flex flex-col items-center justify-start bg-slate-50/80 border border-slate-100 rounded-xl p-1.5 shrink-0 h-fit">
                        <button
                          onClick={() => handleReaccionar(pub.id, "positivo")}
                          title="Votar a favor (+1)"
                          className="p-1 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition border-none bg-transparent cursor-pointer"
                        >
                          <FiArrowUp className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <span className="text-xs font-extrabold text-slate-700 my-0.5">
                          {pub.votos || 0}
                        </span>
                        <button
                          onClick={() => handleReaccionar(pub.id, "negativo")}
                          title="Votar en contra (-1)"
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition border-none bg-transparent cursor-pointer"
                        >
                          <FiArrowDown className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Contenido Principal de la Tarjeta */}
                      <div className="flex-1 min-w-0 space-y-2">
                        
                        {/* Metadatos Superiores: Autor + Materia + Categoría */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          
                          {/* Badge de Materia vinculada */}
                          <button
                            onClick={() => navigate(`/foros/${pub.id_materia}`)}
                            title={`Ir al foro exclusivo de ${materiaNombre}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition border border-indigo-200/80 cursor-pointer text-[11px] group"
                          >
                            <FiBookOpen className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span>Materia: <strong className="font-extrabold">{materiaNombre}</strong></span>
                            {materiaCodigo && <span className="text-indigo-400 font-mono text-[10px]">({materiaCodigo})</span>}
                            {materiaNivel && (
                              <span className="text-indigo-400 font-normal text-[10px] hidden sm:inline">• {materiaNivel}</span>
                            )}
                          </button>

                          {/* Badge de Categoría */}
                          <span className={`px-2 py-0.5 rounded-lg font-semibold text-[10px] border ${getBadgeCategoria(pub.categoria)}`}>
                            {pub.categoria || "General"}
                          </span>

                          <span className="text-slate-300">•</span>

                          {/* Autor */}
                          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                            <span className="font-bold text-slate-700">{autorNombre}</span>
                            <span className="text-slate-400">@{autorUsername}</span>
                          </div>

                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 text-[10px]">{fechaFormat}</span>
                        </div>

                        {/* Título de la Publicación (Clicable hacia detalle) */}
                        <h2
                          onClick={() => navigate(`/foros/${pub.id_materia}/publicacion/${pub.id}`)}
                          className="text-base font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer leading-snug"
                        >
                          {pub.titulo}
                        </h2>

                        {/* Vista previa de Contenido */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {pub.contenido ? pub.contenido.replace(/<[^>]*>?/gm, "") : ""}
                        </p>

                        {/* Etiquetas */}
                        {pub.Etiquetas && pub.Etiquetas.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {pub.Etiquetas.map((tag) => (
                              <span
                                key={tag.id || tag.nombre}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono transition"
                              >
                                #{tag.nombre.replace(/^#/, "")}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Barra de Acciones Inferior */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                          
                          <div className="flex items-center gap-4">
                            {/* Comentarios */}
                            <button
                              onClick={() => navigate(`/foros/${pub.id_materia}/publicacion/${pub.id}`)}
                              className="flex items-center gap-1.5 hover:text-indigo-600 transition border-none bg-transparent cursor-pointer font-semibold"
                            >
                              <FiMessageSquare className="w-3.5 h-3.5" />
                              <span>{pub.cantComentarios || 0} comentarios</span>
                            </button>

                            {/* Guardar */}
                            <button
                              onClick={() => handleGuardar(pub.id)}
                              className={`flex items-center gap-1.5 transition border-none bg-transparent cursor-pointer font-semibold ${
                                pub.esGuardada ? "text-indigo-600 font-bold" : "hover:text-indigo-600"
                              }`}
                            >
                              <FiBookmark className={`w-3.5 h-3.5 ${pub.esGuardada ? "fill-current" : ""}`} />
                              <span>{pub.esGuardada ? "Guardada" : "Guardar"}</span>
                            </button>
                          </div>

                          {/* Compartir */}
                          <button
                            onClick={() => setCompartirData({ isOpen: true, post: pub })}
                            className="flex items-center gap-1.5 hover:text-indigo-600 transition border-none bg-transparent cursor-pointer text-slate-400"
                            title="Compartir publicación"
                          >
                            <FiShare2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Compartir</span>
                          </button>

                        </div>

                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Botón Cargar Más */}
          {hasMore && !cargandoFeed && (
            <div className="text-center pt-2">
              <button
                onClick={() => cargarFeed(false)}
                className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs hover:shadow cursor-pointer"
              >
                Cargar más publicaciones ({publicaciones.length} de {totalFeed})
              </button>
            </div>
          )}

          {cargandoFeed && publicaciones.length > 0 && (
            <div className="text-center py-3 text-xs text-slate-400 font-medium">
              Cargando más publicaciones...
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* BANDA LATERAL DERECHA: FOROS POR MATERIA (lg:col-span-5 sticky)           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          
          {/* Tarjeta de Foros por Materia */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  📚
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Foros por Materia
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {materias.length} cátedras disponibles
                  </p>
                </div>
              </div>
            </div>

            {/* Buscador Rápido de Materias */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={busquedaMateria}
                onChange={(e) => setBusquedaMateria(e.target.value)}
                placeholder="Filtrar materia o código..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Listado de Materias con Scroll Interno elegante */}
            {cargandoMaterias ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-[11px] text-slate-400">Cargando catálogo...</p>
              </div>
            ) : materiasFiltradas.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500">No hay materias que coincidan.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {materiasFiltradas.map((materia) => {
                  const paleta = getColoresCirculo(materia.id);
                  const iniciales = getIniciales(materia.nombre);

                  return (
                    <div
                      key={materia.id}
                      onClick={() => navigate(`/foros/${materia.id}`)}
                      className="group p-2.5 rounded-2xl hover:bg-indigo-50/60 border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between gap-3 cursor-pointer"
                    >
                      {/* Avatar Iniciales + Info */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs ${paleta.bg}`}>
                          {iniciales}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate transition">
                            {materia.nombre}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <span className="font-mono">{materia.codigo}</span>
                            <span>•</span>
                            <span>{materia.nivel_anio}° Año</span>
                          </div>
                        </div>
                      </div>

                      {/* Contador de Posts + Flecha */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-full transition">
                          {materia.cantPublicaciones || 0}
                        </span>
                        <FiChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ListaForos;
