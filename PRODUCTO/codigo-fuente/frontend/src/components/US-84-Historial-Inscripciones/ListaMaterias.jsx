import { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiBarChart2, FiBookOpen } from "react-icons/fi";
import ModalHistorialCursadaMateria from "./ModalHistorialCursadaMateria";

const ListaMaterias = () => {
  const [materias, setMaterias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await axios.get(`${apiUrl}/materias`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMaterias(response.data);
      } catch (error) {
        console.error("Error al cargar materias:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchMaterias();
  }, []);

  const normalizarTexto = (texto) => {
    return texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";
  };

  const materiasFiltradas = materias.filter((m) => {
    const busquedaNormalizada = normalizarTexto(busqueda);
    const nombreNormalizado = normalizarTexto(m.nombre);
    const codigoNormalizado = normalizarTexto(m.codigo);
    
    return nombreNormalizado.includes(busquedaNormalizada) || codigoNormalizado.includes(busquedaNormalizada);
  });

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
    if (!nombre) return "MA";
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
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FiBookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Explorar Materias</h1>
            <p className="text-sm text-zinc-550 dark:text-zinc-400">
              Consulta las materias disponibles y su volumen de inscripciones históricas.
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6 relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
          <FiSearch className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar materia por nombre o código..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none text-sm transition text-zinc-800 dark:text-zinc-200 shadow-sm"
        />
      </div>

      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Listado de Materias</h2>

      {cargando ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="animate-spin text-2xl text-indigo-600">⌛</span>
          <p className="text-sm text-zinc-550 dark:text-zinc-400">Cargando materias...</p>
        </div>
      ) : materiasFiltradas.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-450">No se encontraron materias que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {materiasFiltradas.map((materia) => {
            const colores = getColoresCirculo(materia.id);
            const iniciales = getIniciales(materia.nombre);

            return (
              <div
                key={materia.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col transition shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm ${colores.bg}`}>
                    {iniciales}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2" title={materia.nombre}>
                      {materia.nombre}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 font-medium">Código: {materia.codigo}</p>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => setMateriaSeleccionada(materia)}
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-indigo-650 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl text-xs font-bold border-none cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <FiBarChart2 className="w-4 h-4" /> Ver Estadísticas
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Estadísticas */}
      {materiaSeleccionada && (
        <ModalHistorialCursadaMateria 
          materia={materiaSeleccionada} 
          onClose={() => setMateriaSeleccionada(null)} 
        />
      )}
    </div>
  );
};

export default ListaMaterias;
