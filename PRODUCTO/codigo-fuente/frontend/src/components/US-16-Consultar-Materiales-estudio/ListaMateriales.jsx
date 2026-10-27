import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiCornerDownRight, FiBookOpen, FiTag, FiPlus, FiDownload, FiEye, FiLoader, FiFileText, FiStar } from "react-icons/fi";
import { BsFiletypePdf, BsFiletypeDocx, BsFiletypeXlsx, BsFiletypePptx, BsFiletypeTxt, BsFiletypePng, BsFileEarmark } from "react-icons/bs";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function obtenerInfoFormato(ubicacion = "") {
  const ext = ubicacion.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
      return {
        label: "PDF",
        icon: <BsFiletypePdf className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
        badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200"
      };
    case "doc":
    case "docx":
      return {
        label: "Word",
        icon: <BsFiletypeDocx className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
        badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200"
      };
    case "xls":
    case "xlsx":
      return {
        label: "Excel",
        icon: <BsFiletypeXlsx className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200"
      };
    case "ppt":
    case "pptx":
      return {
        label: "PowerPoint",
        icon: <BsFiletypePptx className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />,
        badge: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200"
      };
    case "txt":
      return {
        label: "TXT",
        icon: <BsFiletypeTxt className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />,
        badge: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border-violet-200"
      };
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      return {
        label: "Imagen",
        icon: <BsFiletypePng className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />,
        badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200"
      };
    default:
      return {
        label: ext ? ext.toUpperCase() : "Archivo",
        icon: <BsFileEarmark className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />,
        badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200"
      };
  }
}

const ListaMateriales = () => {
  const [materiales, setMateriales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const [etiquetaFiltro, setEtiquetaFiltro] = useState("");
  const [sugerencias, setSugerencias] = useState({ porTexto: [], porRelacion: [] });
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]);
  const [todosLosTags, setTodosLosTags] = useState([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [mostrarDesplegable, setMostrarDesplegable] = useState(false);

  const [descargandoId, setDescargandoId] = useState(null);

  const [materialPreview, setMaterialPreview] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);

  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.get(`${API_BASE}/repositorio`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const mappedData = response.data.map((item) => {
          const materiaNombre =
            item.materia?.nombre ||
            (typeof item.materia === "string" ? item.materia : "") ||
            "";

          const autorNombre =
            item.autor?.nombreCompleto ||
            (typeof item.autor === "string" ? item.autor : "") ||
            "Anónimo";

          return {
            id: item.id,
            materiaNombre,
            titulo: item.titulo || "Sin título",
            etiquetas: Array.isArray(item.etiquetas) ? item.etiquetas : [],
            autor: autorNombre,
            idUsuario: item.idUsuario,
            fechaPublicacion: item.fechaPublicacion,
            likes: item.likes ?? 0,
            promedioCalificacion: item.promedioCalificacion || 0,
            totalVotos: item.totalVotos || 0,
            miCalificacion: item.miCalificacion || 0,
            descargas: item.descargas ?? 0,
            ubicacion: item.ubicacion || ""
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

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/repositorio/tags/todos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ranking = res.data?.ranking;
        setTodosLosTags(Array.isArray(ranking) ? ranking : []);
      } catch (e) {
        console.error("Error cargando tags:", e);
        setTodosLosTags([]);
      }
    };
    fetchTodos();
  }, []);

  useEffect(() => {
    const texto = etiquetaFiltro.trim().toLowerCase();
    if (!texto) {
      setSugerencias({ porTexto: [], porRelacion: [] });
      return;
    }

    const fetchSugerencias = async () => {
      setCargandoSugerencias(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const listaSegura = Array.isArray(todosLosTags) ? todosLosTags : [];
        const coincidencias = listaSegura
          .filter(({ tag }) =>
            tag.toLowerCase().includes(texto) &&
            !etiquetasSeleccionadas.includes(tag)
          )
          .slice(0, 6)
          .map(({ tag, count }) => ({ tag, count }));

        let relacionados = [];
        if (etiquetasSeleccionadas.length > 0) {
          const llamadas = etiquetasSeleccionadas.map(tagSel =>
            axios.get(`${API_BASE}/repositorio/tags/relacion`, {
              params: { tag1: tagSel },
              headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.data.ranking || []).catch(() => [])
          );

          const rankings = await Promise.all(llamadas);
          const acumulado = new Map();
          rankings.forEach(ranking => {
            ranking.forEach(({ tag, count }) => {
              acumulado.set(tag, (acumulado.get(tag) || 0) + count);
            });
          });

          const yaEnSeccion1 = new Set(coincidencias);
          relacionados = [...acumulado.entries()]
            .filter(([tag]) =>
              tag.toLowerCase().includes(texto) &&
              !etiquetasSeleccionadas.includes(tag) &&
              !yaEnSeccion1.has(tag)
            )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag, count]) => ({ tag, count }));
        }

        setSugerencias({ porTexto: coincidencias, porRelacion: relacionados });
      } catch (error) {
        console.error("Error al obtener sugerencias:", error);
      } finally {
        setCargandoSugerencias(false);
      }
    };

    const timer = setTimeout(fetchSugerencias, 300);
    return () => clearTimeout(timer);
  }, [etiquetaFiltro, etiquetasSeleccionadas, todosLosTags]);

  const normalizarTexto = (texto) => {
    return texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";
  };

  const materialesFiltrados = materiales.filter((m) => {
    const busquedaNormalizada = normalizarTexto(busqueda);
    const tituloNormalizado = normalizarTexto(m.titulo);
    const materiaNormalizada = normalizarTexto(m.materiaNombre);

    const coincideBusqueda =
      tituloNormalizado.includes(busquedaNormalizada) ||
      materiaNormalizada.includes(busquedaNormalizada);

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

  const handleDescargarDirecto = async (materialItem, e) => {
    e.stopPropagation();
    if (descargandoId === materialItem.id) return;
    setDescargandoId(materialItem.id);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        await axios.post(`${API_BASE}/repositorio/${materialItem.id}/descargas`, {}, { headers });
        setMateriales(prev => prev.map(m => m.id === materialItem.id ? { ...m, descargas: (m.descargas ?? 0) + 1 } : m));
      } catch (err) {
        console.error("Error al registrar descarga:", err);
      }

      const res = await axios.get(`${API_BASE}/repositorio/${materialItem.id}/descargar`, {
        headers,
        responseType: "blob"
      });

      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = materialItem.titulo || "archivo";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("No se pudo descargar el archivo");
    } finally {
      setDescargandoId(null);
    }
  };

  const abrirVistaPrevia = async (materialItem, e) => {
    e.stopPropagation();
    setMaterialPreview(materialItem);
    setCargandoPreview(true);
    setPreviewBlobUrl(null);

    const ext = materialItem.ubicacion.split(".").pop().toLowerCase();
    if (["pdf", "png", "jpg", "jpeg", "webp"].includes(ext)) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/repositorio/${materialItem.id}/descargar`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        });
        const url = URL.createObjectURL(res.data);
        setPreviewBlobUrl(url);
      } catch (err) {
        console.error("Error al cargar preview:", err);
      }
    }
    setCargandoPreview(false);
  };

  const cerrarVistaPrevia = () => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setMaterialPreview(null);
    setPreviewBlobUrl(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FiBookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Apuntes de la red</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Busca y consulta material de estudio compartido.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/repositorio/agregar')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          Agregar material
        </button>
      </div>

      {/* Grid de Búsqueda y Etiquetas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
            onBlur={() => setTimeout(() => setMostrarDesplegable(false), 200)}
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

          {mostrarDesplegable && etiquetaFiltro.trim() !== "" && (
            <div className="absolute right-0 left-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {cargandoSugerencias ? (
                <div className="p-3 text-xs text-zinc-400 text-center">Buscando...</div>
              ) : (
                <>
                  {sugerencias.porTexto.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => {
                        if (!etiquetasSeleccionadas.includes(sug.tag)) {
                          setEtiquetasSeleccionadas(prev => [...prev, sug.tag]);
                        }
                        setEtiquetaFiltro("");
                        setMostrarDesplegable(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-xs text-zinc-700 dark:text-zinc-300 font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5"><FiTag className="w-3 h-3 text-indigo-500" />#{sug.tag}</span>
                      <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-500">{sug.count} usos</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Etiquetas Activas */}
      {etiquetasSeleccionadas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Etiquetas activas:</span>
          {etiquetasSeleccionadas.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-650 text-xs font-bold rounded-xl border border-indigo-100/50">
              #{tag}
              <button onClick={() => setEtiquetasSeleccionadas(prev => prev.filter(t => t !== tag))} className="ml-1 font-bold cursor-pointer">×</button>
            </span>
          ))}
          <button onClick={() => setEtiquetasSeleccionadas([])} className="text-xs text-rose-500 font-semibold cursor-pointer ml-2 bg-transparent border-none">Limpiar filtros</button>
        </div>
      )}

      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Materiales de Estudio</h2>

      {cargando ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="animate-spin text-2xl text-indigo-600">⌛</span>
          <p className="text-sm text-zinc-500">Cargando...</p>
        </div>
      ) : materialesFiltrados.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">No se encontraron apuntes que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {materialesFiltrados.map((material) => {
            const colores = getColoresCirculo(material.id);
            const iniciales = getIniciales(material.titulo);
            const formatoInfo = obtenerInfoFormato(material.ubicacion);
            const estaDescargando = descargandoId === material.id;

            return (
              <div
                key={material.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/40 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 items-center gap-4 transition shadow-sm hover:shadow-md"
              >
                {/* Izquierda: Iniciales + Info (6 cols) */}
                <div className="md:col-span-6 flex items-start gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm self-center ${colores.bg}`}>
                    {iniciales}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${formatoInfo.badge}`}>
                        {formatoInfo.icon}
                        <span>{formatoInfo.label}</span>
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                        {material.tamano}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 truncate w-full" title={material.titulo}>
                      {material.titulo}
                    </h3>
                    
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Materia: <strong className="text-zinc-700 dark:text-zinc-300">{material.materiaNombre || "N/A"}</strong>
                      </span>
                      <span className="text-[11px] text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5 flex-wrap">
                        <span>Por: {material.autor}</span>
                        <span>•</span>
                        <span>{formatearFecha(material.fechaPublicacion)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <FiDownload className="w-3.5 h-3.5" />
                          <span>{material.descargas ?? 0}</span>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Centro: Etiquetas (2 cols) */}
                <div className="md:col-span-2 flex items-center text-xs">
                  {material.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {material.etiquetas.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold rounded-md border border-indigo-100/20">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Derecha: Calificación con Estrellas y Botones de Acción (4 cols) */}
                <div className="md:col-span-4 flex flex-col md:items-end gap-2 shrink-0">
                  
                  {/* Calificación de Estrellas restaurada */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <FiStar className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {material.promedioCalificacion ? parseFloat(material.promedioCalificacion).toFixed(1) : "0.0"}
                    </span>
                    <span className="text-zinc-400 font-normal">
                      ({material.totalVotos || 0} {material.totalVotos === 1 ? "voto" : "votos"})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={(e) => abrirVistaPrevia(material, e)}
                      className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border-none"
                      title="Vista Previa Rápida"
                    >
                      <FiEye className="w-3.5 h-3.5" /> Vista Previa
                    </button>

                    <button
                      onClick={(e) => handleDescargarDirecto(material, e)}
                      disabled={estaDescargando}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border-none shrink-0"
                      title="Descargar archivo"
                    >
                      {estaDescargando ? (
                        <FiLoader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FiDownload className="w-3.5 h-3.5" />
                      )}
                      <span>{estaDescargando ? "Descargando..." : "Descargar"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/repositorio/${material.id}`)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold bg-transparent border-none cursor-pointer self-start md:self-end mt-0.5"
                  >
                    Ver detalle completo (calificar) →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL DE VISTA PREVIA RÁPIDA EMBEBIDA ── */}
      {materialPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-zinc-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
            
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">{materialPreview.titulo}</h3>
                <p className="text-xs text-zinc-500">Materia: {materialPreview.materiaNombre} • Tamaño: {materialPreview.tamano}</p>
              </div>
              <button onClick={cerrarVistaPrevia} className="text-zinc-400 hover:text-zinc-700 text-lg font-bold p-1 bg-transparent border-none cursor-pointer">×</button>
            </div>

            <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-4 flex items-center justify-center min-h-[400px] overflow-auto">
              {cargandoPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <FiLoader className="w-6 h-6 animate-spin text-indigo-600" />
                  <p className="text-xs text-zinc-500">Cargando previsualización...</p>
                </div>
              ) : previewBlobUrl && materialPreview.ubicacion.endsWith('.pdf') ? (
                <iframe src={previewBlobUrl} title="Vista previa PDF" className="w-full h-[500px] border-none rounded-lg" />
              ) : previewBlobUrl && /\.(png|jpg|jpeg|webp)\$/i.test(materialPreview.ubicacion) ? (
                <img src={previewBlobUrl} alt="Vista previa" className="max-w-full max-h-[500px] object-contain rounded-lg" />
              ) : (
                <div className="text-center py-12">
                  <FiFileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 mb-4">Este tipo de formato no soporta previsualización directa en el modal.</p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 bg-white dark:bg-zinc-900">
              <button onClick={cerrarVistaPrevia} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold cursor-pointer border-none">
                Cerrar
              </button>
              <button onClick={(e) => handleDescargarDirecto(materialPreview, e)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none">
                <FiDownload className="w-3.5 h-3.5" /> Descargar Archivo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ListaMateriales;