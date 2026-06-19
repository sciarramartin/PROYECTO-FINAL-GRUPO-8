import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiBookmark, 
  FiArrowUp, 
  FiMessageSquare, 
  FiTrash2, 
  FiSearch, 
  FiFolder, 
  FiChevronRight,
  FiAlertCircle,
  FiBookOpen
} from "react-icons/fi";

const MisGuardados = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);
  const navigate = useNavigate();

  const fetchGuardados = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.get(`${apiUrl}/publicaciones/guardadas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPublicaciones(response.data);
    } catch (error) {
      console.error("Error al cargar publicaciones guardadas:", error);
      mostrarAlerta("Error al cargar las publicaciones guardadas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchGuardados();
  }, []);

  const mostrarAlerta = (mensaje) => {
    setAlerta(mensaje);
    setTimeout(() => setAlerta(null), 4000);
  };

  const handleDesguardar = async (e, id) => {
    e.stopPropagation(); // Evitar redirigir al detalle al hacer clic en el botón de desguardar
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.post(`${apiUrl}/publicaciones/${id}/guardar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.guardada) {
        setPublicaciones(prev => prev.filter(p => p.id !== id));
        mostrarAlerta("Publicación eliminada de tus guardados.");
      }
    } catch (error) {
      console.error("Error al desguardar publicación:", error);
      mostrarAlerta("No se pudo quitar de guardados.");
    }
  };

  const normalizarTexto = (texto) => {
    return texto
      ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";
  };

  const publicacionesFiltradas = publicaciones.filter((p) => {
    const query = normalizarTexto(busqueda);
    const titulo = normalizarTexto(p.titulo);
    const contenido = normalizarTexto(p.contenido);
    
    // Buscar materia
    const materiaNombre = p.Materia?.nombre || p.materium?.nombre || p.materia?.nombre || "";
    const materiaNormalizada = normalizarTexto(materiaNombre);
    
    return titulo.includes(query) || contenido.includes(query) || materiaNormalizada.includes(query);
  });

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
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

  const renderAvatar = (autor) => {
    const nombre = autor?.nombre || "U";
    const apellido = autor?.apellido || "A";
    const iniciales = `${nombre[0]}${apellido[0]}`.toUpperCase();
    const foto = autor?.Perfil?.foto_perfil || autor?.perfil?.foto_perfil;

    if (!foto) {
      return (
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] text-white font-extrabold shrink-0 shadow-sm">
          {iniciales}
        </div>
      );
    }
    
    const src = foto.startsWith('data:') ? foto : `data:image/jpeg;base64,${foto}`;
    return (
      <img
        src={src}
        alt="Avatar"
        className="w-6 h-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '';
          e.target.outerHTML = `<div class="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white font-extrabold text-[10px] shrink-0">${iniciales}</div>`;
        }}
      />
    );
  };

  return (
    <div className="min-h-full pb-10">
      
      {/* Toast Alert */}
      {alerta && (
        <div className="fixed top-20 right-6 left-6 md:left-auto md:w-96 z-50 bg-indigo-50 dark:bg-indigo-950/90 border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-300 p-4 rounded-xl shadow-lg flex items-start gap-2.5 animate-in fade-in slide-in-from-top-4">
          <FiAlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold">Notificación</p>
            <p className="text-[11px] mt-0.5 leading-relaxed">{alerta}</p>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-4 select-none">
        <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition" onClick={() => navigate("/dashboard")}>Inicio</span>
        <FiChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition" onClick={() => navigate("/foros")}>Foros</span>
        <FiChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Mis Guardados</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FiBookmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400 fill-indigo-600/10" />
            Mis Publicaciones Guardadas
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1">
            Colección de publicaciones del foro que has marcado para leer o consultar más tarde.
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
            placeholder="Buscar por título, contenido o foro..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-zinc-800 dark:text-zinc-200 shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      {cargando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              </div>
              <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                </div>
                <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : publicacionesFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <FiBookmark className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            {busqueda ? "No se encontraron publicaciones" : "Aún no tienes publicaciones guardadas"}
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium max-w-sm mx-auto mt-2 leading-relaxed">
            {busqueda 
              ? "Prueba refinando los términos de búsqueda o borrando el filtro actual."
              : "Cuando encuentres una publicación interesante en el foro de una materia, guárdala para tener acceso rápido desde aquí."}
          </p>
          {!busqueda && (
            <button
              onClick={() => navigate("/foros")}
              className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition shadow-md shadow-indigo-500/10 flex items-center gap-2 mx-auto"
            >
              <FiBookOpen className="w-4 h-4" />
              Explorar Foros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publicacionesFiltradas.map((pub) => {
            const materiaNombre = pub.Materia?.nombre || pub.materium?.nombre || pub.materia?.nombre || "Foro";
            const materiaId = pub.id_materia;
            const autorNombre = pub.Autor ? `${pub.Autor.nombre} ${pub.Autor.apellido}` : "Usuario Anónimo";
            
            return (
              <div
                key={pub.id}
                onClick={() => navigate(`/foros/${materiaId}/publicacion/${pub.id}`)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-900/60 hover:shadow-md transition duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Ribbon hover decoration */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-transparent group-hover:bg-indigo-500 dark:group-hover:bg-indigo-600 transition-colors" />

                <div>
                  {/* Category & Subject Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getColoresCategoria(pub.categoria)}`}>
                        {pub.categoria || "General"}
                      </span>
                      <span className="text-[10px] bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-full font-bold truncate max-w-[150px]">
                        {materiaNombre}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium shrink-0">
                      {formatearFecha(pub.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    {pub.titulo}
                  </h3>

                  {/* Body Snippet */}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {pub.contenido}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 mt-4 pt-3.5">
                  {/* Author info */}
                  <div className="flex items-center gap-2">
                    {renderAvatar(pub.Autor)}
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                      {autorNombre}
                    </span>
                  </div>

                  {/* Votes, comments, unsave actions */}
                  <div className="flex items-center gap-3.5 text-zinc-400 dark:text-zinc-500">
                    <div className="flex items-center gap-1">
                      <FiArrowUp className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-extrabold">{pub.votos || 0}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDesguardar(e, pub.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-450 hover:text-red-650 dark:hover:text-red-400 rounded-lg border-none bg-transparent cursor-pointer transition"
                      title="Quitar de guardados"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisGuardados;
