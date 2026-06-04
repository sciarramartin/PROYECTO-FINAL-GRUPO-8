import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSearch, FiInfo, FiUsers, FiMessageSquare, FiCompass, FiCornerDownRight } from "react-icons/fi";

const ListaForos = () => {
  const [materias, setMaterias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const response = await axios.get(`${apiUrl}/foro/materias`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMaterias(response.data);
      } catch (error) {
        console.error("Error al cargar materias del foro:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchMaterias();
  }, []);

  // Filtrado de materias por búsqueda (ignora acentos)
  const normalizarTexto = (texto) => {
    return texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";
  };

  const materiasFiltradas = materias.filter((m) => {
    const busquedaNormalizada = normalizarTexto(busqueda);
    return (
      normalizarTexto(m.nombre).includes(busquedaNormalizada) ||
      normalizarTexto(m.codigo).includes(busquedaNormalizada)
    );
  });

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
    return paletas[id % paletas.length];
  };

  const getIniciales = (nombre) => {
    const palabras = nombre.split(" ");
    if (palabras.length >= 2) {
      // Ignorar "Ingeniería", "Licenciatura", etc. si es común, pero si es materia: "Análisis Matemático II" -> AM
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
          <FiMessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Foros por materia</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Seleccioná una materia para ver las discusiones, dudas y opiniones de la comunidad.
          </p>
        </div>
      </div>



      {/* Barra de búsqueda */}
      <div className="relative mb-6">
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

      {/* Listado de materias */}
      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Mis materias</h2>

      {cargando ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="animate-spin text-2xl text-indigo-650">⌛</span>
          <p className="text-sm text-zinc-550 dark:text-zinc-400">Cargando materias...</p>
        </div>
      ) : materiasFiltradas.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-450">No se encontraron materias que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {materiasFiltradas.map((materia) => {
            const colores = getColoresCirculo(materia.id);
            const iniciales = getIniciales(materia.nombre);

            return (
              <div 
                key={materia.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/40 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 items-center gap-4 transition shadow-sm hover:shadow-md"
              >
                {/* Izquierda: Iniciales + Nombre (6 columnas) */}
                <div className="md:col-span-6 flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm ${colores.bg}`}>
                    {iniciales}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 truncate w-full" title={materia.nombre}>
                      {materia.nombre}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {materia.codigo} - {materia.nivel_anio}° Año ({materia.cuatrimestre}° Cuatrimestre)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Centro: Estadísticas (3 columnas, alineación fija) */}
                <div className="md:col-span-3 flex items-center md:justify-center text-xs font-semibold text-zinc-650 dark:text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <FiMessageSquare className="w-4 h-4 text-zinc-400" />
                    <div>
                      <span className="block font-bold text-left md:text-center">{materia.cantPublicaciones}</span>
                      <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium leading-none">Publicaciones</span>
                    </div>
                  </div>
                </div>

                {/* Derecha: Botón de Acción (3 columnas, alineación derecha) */}
                <div className="md:col-span-3 flex md:justify-end">
                  <button
                    onClick={() => navigate(`/foros/${materia.id}`)}
                    className="w-full md:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-indigo-650 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl text-xs font-bold border-none cursor-pointer transition flex items-center justify-center gap-1 shrink-0"
                  >
                    Ver foro <FiCornerDownRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Banner Informativo */}
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/25 rounded-2xl flex gap-3 text-xs text-indigo-800 dark:text-indigo-350 leading-relaxed shadow-sm">
        <FiInfo className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-0.5">¿Cómo funciona el Foro?</h4>
          <p>
            Cada foro está asociado a una materia del plan de estudios. Aquí puedes consultar dudas sobre contenidos, metodologías de estudio o material complementario que publican otros alumnos y docentes.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ListaForos;
