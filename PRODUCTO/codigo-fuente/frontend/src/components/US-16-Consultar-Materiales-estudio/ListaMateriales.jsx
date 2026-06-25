import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiInfo, FiCornerDownRight, FiHeart, FiBookOpen, FiTag } from "react-icons/fi";

const ListaMateriales = () => {
  const [materiales, setMateriales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // Estados para filtro y relaciones de etiquetas
  const [etiquetaFiltro, setEtiquetaFiltro] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [mostrarDesplegable, setMostrarDesplegable] = useState(false);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);

  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await axios.get(`${apiUrl}/repositorio`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Mapeamos los datos con un formateador robusto para soportar diferentes formatos de claves JSON
        const mappedData = response.data.map((item) => {
          const id = item.id !== undefined ? item.id : (item.id_material || item.idMaterial || Math.random());

          let materiaNombre = "";
          if (item.materia) {
            if (typeof item.materia === "object") {
              materiaNombre = item.materia.nombre || item.materia.id || "";
            } else {
              materiaNombre = item.materia;
            }
          } else if (item.id_materia || item.materiaId) {
            materiaNombre = item.id_materia || item.materiaId;
          }

          const titulo = item.titulo || item.nombre || "Sin título";

          let etiquetas = [];
          if (Array.isArray(item.etiquetas)) {
            etiquetas = item.etiquetas;
          } else if (typeof item.etiquetas === "string") {
            try {
              const parsed = JSON.parse(item.etiquetas);
              if (Array.isArray(parsed)) {
                etiquetas = parsed;
              } else {
                etiquetas = [parsed];
              }
            } catch (e) {
              etiquetas = item.etiquetas.split(/[,,; ]+/).filter(Boolean);
            }
          }

          const autor = item.autor || "";
          const idUsuario = item["id usuario"] || item.id_usuario || item.idUsuario || item.usuarioId || item.autorId || "";
          const fechaPublicacion = item["fecha de publicación"] || item.fecha_publicacion || item.fecha_de_publicacion || item.fechaPublicacion || item.fecha || "";
          const likes = item.likes !== undefined ? item.likes : (item.cantLikes || 0);

          return {
            id,
            materiaNombre,
            titulo,
            etiquetas,
            autor,
            idUsuario,
            fechaPublicacion,
            likes
          };
        });

        setMateriales(mappedData);
      } catch (error) {
        console.error("Error al cargar materiales de estudio:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchMateriales();
  }, []);

  // Efecto para consultar las relaciones de etiquetas al escribir (debounced 300ms)
  useEffect(() => {
    const fetchSugerencias = async () => {
      if (!etiquetaFiltro.trim()) {
        setSugerencias([]);
        return;
      }
      setCargandoSugerencias(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await axios.get(`${apiUrl}/repositorio/tags/relacion`, {
          params: { tag1: etiquetaFiltro.trim() },
          headers: { Authorization: `Bearer ${token}` }
        });
        setSugerencias(response.data.ranking || []);
      } catch (error) {
        console.error("Error al obtener relaciones de etiquetas:", error);
      } finally {
        setCargandoSugerencias(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSugerencias();
    }, 300);

    return () => clearTimeout(timer);
  }, [etiquetaFiltro]);

  // Filtrado de materias por búsqueda (ignora acentos)
  const normalizarTexto = (texto) => {
    return texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";
  };

  const materialesFiltrados = materiales.filter((m) => {
    const busquedaNormalizada = normalizarTexto(busqueda);
    const tituloNormalizado = normalizarTexto(m.titulo);
    const materiaNormalizada = normalizarTexto(m.materiaNombre);

    // Coincide con la búsqueda principal de título o materia
    const coincideBusqueda =
      tituloNormalizado.includes(busquedaNormalizada) ||
      materiaNormalizada.includes(busquedaNormalizada);

    // Coincide con todas las etiquetas seleccionadas
    const coincideEtiquetas = etiquetasSeleccionadas.every(selTag => {
      const selTagNorm = normalizarTexto(selTag);
      return m.etiquetas.some(t => normalizarTexto(t) === selTagNorm);
    });

    return coincideBusqueda && coincideEtiquetas;
  });

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return fechaStr;
      return fecha.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (e) {
      return fechaStr;
    }
  };

  // Colores predefinidos elegantes para las iniciales según el id o nombre
  const getColoresCirculo = (id) => {
    const paletas = [
      { bg: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" },
      { bg: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
      { bg: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
      { bg: "bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400" },
      { bg: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" },
      { bg: "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" }
    ];
    const numericId = typeof id === "number" ? id : 0;
    return paletas[numericId % paletas.length];
  };

  const getIniciales = (nombre) => {
    if (!nombre) return "AP";
    const palabras = nombre.trim().split(/\s+/);
    if (palabras.length >= 2) {
      const p1 = palabras[0].charAt(0);
      const p2 = palabras[1].toLowerCase() === "y" && palabras[2] ? palabras[2].charAt(0) : palabras[1].charAt(0);
      return (p1 + p2).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <FiBookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Apuntes de la red</h1>
          <p className="text-sm text-zinc-550 dark:text-zinc-400">
            Busca y consulta material de estudio compartido por otros estudiantes. Filtra por título, materia o etiquetas.
          </p>
        </div>
      </div>

      {/* Grid de Búsqueda y Etiquetas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Barra de búsqueda principal (75%) */}
        <div className="md:col-span-3 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
            <FiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar un apunte por título o materia..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none text-sm transition text-zinc-800 dark:text-zinc-200 shadow-sm"
          />
        </div>

        {/* Input pequeño para etiquetas (25%) */}
        <div className="md:col-span-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
            <FiTag className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={etiquetaFiltro}
            onChange={(e) => {
              setEtiquetaFiltro(e.target.value);
              setMostrarDesplegable(true);
            }}
            onFocus={() => setMostrarDesplegable(true)}
            onBlur={() => {
              // Delay hiding suggestions so click events register
              setTimeout(() => setMostrarDesplegable(false), 200);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && etiquetaFiltro.trim()) {
                const tagToAdd = etiquetaFiltro.trim().toLowerCase();
                if (!etiquetasSeleccionadas.includes(tagToAdd)) {
                  setEtiquetasSeleccionadas(prev => [...prev, tagToAdd]);
                }
                setEtiquetaFiltro("");
                setMostrarDesplegable(false);
              }
            }}
            placeholder="Etiqueta..."
            className="w-full pl-9 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none text-sm transition text-zinc-800 dark:text-zinc-200 shadow-sm"
          />

          {/* Desplegable de sugerencias */}
          {mostrarDesplegable && (etiquetaFiltro.trim() !== "") && (
            <div className="absolute right-0 left-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {cargandoSugerencias ? (
                <div className="p-3 text-xs text-zinc-400 dark:text-zinc-500 text-center flex items-center justify-center gap-1.5">
                  <span className="animate-spin">⌛</span> Buscando relación...
                </div>
              ) : sugerencias.length === 0 ? (
                <div className="p-3 text-xs text-zinc-400 dark:text-zinc-500 text-center">
                  Sin etiquetas relacionadas
                </div>
              ) : (
                <div className="py-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    Etiquetas en común con "{etiquetaFiltro}"
                  </div>
                  {sugerencias.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const tagToAdd = sug.tag;
                        if (!etiquetasSeleccionadas.includes(tagToAdd)) {
                          setEtiquetasSeleccionadas(prev => [...prev, tagToAdd]);
                        }
                        const primaryTag = etiquetaFiltro.trim().toLowerCase();
                        if (!etiquetasSeleccionadas.includes(primaryTag)) {
                          setEtiquetasSeleccionadas(prev => [...prev, primaryTag]);
                        }
                        setEtiquetaFiltro("");
                        setMostrarDesplegable(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs text-zinc-700 dark:text-zinc-350 font-medium flex items-center justify-between border-none cursor-pointer transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <FiTag className="w-3 h-3 text-indigo-500" />
                        #{sug.tag}
                      </span>
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-400 font-semibold">
                        {sug.count} {sug.count === 1 ? 'en común' : 'en común'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Etiquetas Activas */}
      {etiquetasSeleccionadas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 items-center animate-fadeIn">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Etiquetas activas:</span>
          {etiquetasSeleccionadas.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-100/50"
            >
              #{tag}
              <button
                onClick={() => setEtiquetasSeleccionadas(prev => prev.filter(t => t !== tag))}
                className="ml-1 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-bold focus:outline-none cursor-pointer text-sm"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => setEtiquetasSeleccionadas([])}
            className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-350 font-semibold focus:outline-none cursor-pointer ml-2 border-none bg-transparent"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Listado de apuntes */}
      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Materiales de Estudio</h2>

      {cargando ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="animate-spin text-2xl text-indigo-600">⌛</span>
          <p className="text-sm text-zinc-550 dark:text-zinc-400">Cargando ...</p>
        </div>
      ) : materialesFiltrados.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-450">No se encontraron apuntes que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {materialesFiltrados.map((material) => {
            const colores = getColoresCirculo(material.id);
            const iniciales = getIniciales(material.titulo);

            return (
              <div
                key={material.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/40 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 items-center gap-4 transition shadow-sm hover:shadow-md"
              >
                {/* Izquierda: Iniciales + Título + Info (6 columnas) */}
                <div className="md:col-span-6 flex items-start gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm self-center ${colores.bg}`}>
                    {iniciales}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 truncate w-full" title={material.titulo}>
                      {material.titulo}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-xs text-zinc-550 dark:text-zinc-400 font-medium">
                        Materia: <strong className="text-zinc-750 dark:text-zinc-300 font-semibold">{material.materiaNombre || "N/A"}</strong>
                      </span>
                      <span className="text-[11px] text-zinc-450 dark:text-zinc-500">
                        Por: {material.autor || "Anónimo"} • {formatearFecha(material.fechaPublicacion)}
                      </span>
                      {material.etiquetas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {material.etiquetas.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 text-[10px] font-semibold rounded-md border border-indigo-100/20"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Centro: Likes (3 columnas) */}
                <div className="md:col-span-3 flex items-center md:justify-center text-xs font-semibold text-zinc-650 dark:text-zinc-300">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-455 rounded-xl border border-rose-100/20">
                    <FiHeart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                    <div>
                      <span className="block font-bold text-left md:text-center">{material.likes}</span>
                      <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium leading-none">Likes</span>
                    </div>
                  </div>
                </div>

                {/* Derecha: Botón de Acción (3 columnas) */}
                <div className="md:col-span-3 flex md:justify-end">
                  <button
                    onClick={() => navigate(`/repositorio/${material.id}`)}
                    className="w-full md:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-indigo-650 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl text-xs font-bold border-none cursor-pointer transition flex items-center justify-center gap-1 shrink-0"
                  >
                    Ver apunte <FiCornerDownRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Banner Informativo */}
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/25 rounded-2xl flex gap-3 text-xs text-indigo-850 dark:text-indigo-350 leading-relaxed shadow-sm">
        <FiInfo className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-0.5">¿Cómo funciona el repositorio?</h4>
          <p>
            Cada apunte está asociado a distintas etiquetas y materias. Puedes escribir una etiqueta en el buscador secundario para encontrar otras relacionadas en común o aplicar filtros combinados haciendo clic en los resultados del desplegable.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ListaMateriales;
