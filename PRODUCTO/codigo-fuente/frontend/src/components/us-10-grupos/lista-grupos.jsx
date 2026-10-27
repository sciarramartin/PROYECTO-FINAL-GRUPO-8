import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmptyState from "../common/EmptyState";

const ListaGrupos = () => {
  const navigate = useNavigate();
  const [gruposPropistas, setGruposPropistas] = useState([]); // Mis Grupos
  const [gruposExploracion, setGruposExploracion] = useState([]); // Explorar
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  
  // Tabs: "mis_grupos" o "explorar"
  const [tabActiva, setTabActiva] = useState("mis_grupos");
  
  // Estados para búsqueda y modal
  const [filtro, setFiltro] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [descripcionNueva, setDescripcionNueva] = useState("");
  const [estadoNuevo, setEstadoNuevo] = useState("publico"); // 'publico' o 'privado'
  const [creando, setCreando] = useState(false);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const getUsuarioId = () => {
    try {
      const uStr = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
      if (uStr && uStr !== "undefined") {
        const parsed = JSON.parse(uStr);
        return parsed?.id;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };
  const miUsuarioId = getUsuarioId();

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const headers = { Authorization: `Bearer ${token}` };
      
      // Llamadas paralelas a mis grupos y exploración
      const [misGruposRes, explorarRes] = await Promise.all([
        axios.get(`${apiUrl}/grupos`, { headers }),
        axios.get(`${apiUrl}/grupos/explorar`, { headers })
      ]);
      
      setGruposPropistas(misGruposRes.data);
      setGruposExploracion(explorarRes.data);
    } catch (err) {
      console.error("Error al cargar grupos:", err);
      setError("No se pudieron sincronizar los grupos de estudio.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarDatos();
    } else {
      navigate("/login");
    }

    // Escuchar la creación de grupos y notificaciones de mensajes en tiempo real
    if (window.socket) {
      const manejarGrupoCreado = (nuevoGrupo) => {
        console.log("[Socket.io] Nuevo grupo creado detectado:", nuevoGrupo);
        cargarDatos();
      };

      const manejarNuevaNotificacion = () => {
        console.log("[Socket.io] Nueva notificación de grupo recibida en lista-grupos, recargando...");
        cargarDatos();
      };

      window.socket.on("grupo_creado", manejarGrupoCreado);
      window.socket.on("nuevo_mensaje_grupo_notificacion", manejarNuevaNotificacion);

      return () => {
        if (window.socket) {
          window.socket.off("grupo_creado", manejarGrupoCreado);
          window.socket.off("nuevo_mensaje_grupo_notificacion", manejarNuevaNotificacion);
        }
      };
    }
  }, []);

  const handleCrearGrupo = async (e) => {
    e.preventDefault();
    if (!nombreNuevo.trim()) {
      setError("El nombre del grupo es obligatorio.");
      return;
    }

    setCreando(true);
    setError("");
    setMensaje("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await axios.post(`${apiUrl}/grupos`, {
        nombre: nombreNuevo.trim(),
        descripcion: descripcionNueva.trim(),
        estado: estadoNuevo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensaje(`¡Grupo "${response.data.nombre}" creado con éxito!`);
      setNombreNuevo("");
      setDescripcionNueva("");
      setEstadoNuevo("publico");
      setModalAbierto(false);
      
      // Recargar listas
      await cargarDatos();
    } catch (err) {
      console.error("Error al crear grupo:", err);
      setError(err.response?.data?.error || "Ocurrió un error al crear el grupo.");
    } finally {
      setCreando(false);
    }
  };

  // Filtrar grupos mostrados según búsqueda
  const gruposActuales = tabActiva === "mis_grupos" ? gruposPropistas : gruposExploracion;
  const gruposFiltrados = gruposActuales.filter(grupo =>
    grupo.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-2">
      
      {/* Cabecera Principal */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5 transition-colors duration-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-tight font-sans transition-colors duration-200">Grupos de Estudio</h1>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 transition-colors duration-200">Colaborá con compañeros de tu materia, compartí archivos y comunicate de forma ágil.</p>
        </div>
        
        {/* Botón Compacto y a la Derecha */}
        <button
          onClick={() => {
            setError("");
            setMensaje("");
            setModalAbierto(true);
          }}
          className="self-end md:self-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors duration-200 shadow-sm flex items-center gap-1.5 hover:shadow-md cursor-pointer border-none shrink-0"
        >
          <span className="text-sm font-semibold">+</span> Crear Grupo
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-xs mb-4 max-w-xl animate-fade-in flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
      {mensaje && (
        <div className="bg-green-50 dark:bg-emerald-950/30 border border-green-200 dark:border-emerald-900/50 text-green-600 dark:text-emerald-400 rounded-xl px-4 py-3 text-xs mb-4 max-w-xl animate-fade-in flex items-center gap-2">
          <span>✓</span> {mensaje}
        </div>
      )}

      {/* TABS DE CONTROL: Mis Grupos vs Explorar */}
      <div className="border-b border-gray-200 dark:border-slate-800 flex gap-6 mb-6 transition-colors duration-200">
        <button
          onClick={() => {
            setTabActiva("mis_grupos");
            setFiltro("");
          }}
          className={`pb-3 text-xs font-bold relative transition-colors duration-200 cursor-pointer ${
            tabActiva === "mis_grupos" ? "text-indigo-600 dark:text-indigo-400 font-extrabold" : "text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
          }`}
        >
          Mis Grupos ({gruposPropistas.length})
          {tabActiva === "mis_grupos" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => {
            setTabActiva("explorar");
            setFiltro("");
          }}
          className={`pb-3 text-xs font-bold relative transition-colors duration-200 cursor-pointer ${
            tabActiva === "explorar" ? "text-indigo-600 dark:text-indigo-400 font-extrabold" : "text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
          }`}
        >
          Explorar Grupos ({gruposExploracion.length})
          {tabActiva === "explorar" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Barra de Filtro / Búsqueda */}
      <div className="mb-6">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
            🔍
          </span>
          <input
            type="text"
            placeholder={tabActiva === "mis_grupos" ? "Buscar en mis grupos..." : "Explorar grupos públicos..."}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            maxLength={60}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-colors duration-200 outline-none text-gray-700 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
          />
          {filtro && (
            <button
              onClick={() => setFiltro("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Listado de Grupos */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400 font-medium">Sincronizando grupos...</p>
        </div>
      ) : gruposFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gruposFiltrados.map((grupo) => {
            const inicial = grupo.nombre[0].toUpperCase();
            return (
              <div
                key={grupo.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-slate-700 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Ficha Inicial del Grupo */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-base font-extrabold shrink-0 transition-colors duration-200">
                        {inicial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 leading-snug truncate transition-colors duration-200">
                            {grupo.nombre}
                          </h3>
                          {(() => {
                            const ultMsg = grupo.ultimoMensaje;
                            if (ultMsg && miUsuarioId && Number(ultMsg.id_usuario) !== Number(miUsuarioId)) {
                              const ultimosVistos = JSON.parse(localStorage.getItem(`grupo_ultimo_visto_${miUsuarioId}`) || "{}");
                              let ultimoVistoId = ultimosVistos[grupo.id] || 0;
                              if (Number(ultimoVistoId) > Number(ultMsg.id)) {
                                ultimoVistoId = 0;
                                ultimosVistos[grupo.id] = 0;
                                localStorage.setItem(`grupo_ultimo_visto_${miUsuarioId}`, JSON.stringify(ultimosVistos));
                              }
                              if (Number(ultMsg.id) > Number(ultimoVistoId)) {
                                return (
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 inline-block animate-pulse" title="Nuevo mensaje pendiente" />
                                );
                              }
                            }
                            return null;
                          })()}
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5 truncate transition-colors duration-200">
                          Por: {grupo.Creador ? `${grupo.Creador.nombre} ${grupo.Creador.apellido}` : "Tú"}
                        </p>
                      </div>
                    </div>

                    {/* Badge de Visibilidad */}
                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full shrink-0 border uppercase tracking-wider transition-colors duration-200 ${
                      grupo.estado === 'publico' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40' 
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40'
                    }`}>
                      {grupo.estado === 'publico' ? 'Público' : 'Privado'}
                    </span>
                  </div>

                  {/* Descripción del Grupo */}
                  <div className="text-xs text-gray-500 dark:text-slate-400 mb-4 bg-gray-50 dark:bg-slate-800/60 p-3 rounded-xl border border-gray-100 dark:border-slate-800 min-h-[64px] line-clamp-3 transition-colors duration-200">
                    {grupo.descripcion || "Este grupo no tiene una descripción configurada aún. ¡Ingresá y definí un tema de estudio!"}
                  </div>
                </div>

                {/* Acción de Entrada/Ver */}
                <button
                  onClick={() => navigate(`/grupos/${grupo.id}`)}
                  className="w-full py-2 rounded-lg text-xs font-bold text-center transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer border border-transparent bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:border-indigo-200 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-900/50"
                >
                  {tabActiva === "mis_grupos" ? "💬 Entrar al Chat" : "👁 Explorar / Unirse"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State Ilustrado US-V05 */
        <EmptyState
          variant={filtro ? "search" : "groups"}
          titulo={
            filtro 
              ? "No se encontraron grupos con ese nombre" 
              : tabActiva === "mis_grupos" 
                ? "Aún no eres miembro de ningún grupo" 
                : "No hay más grupos públicos para explorar"
          }
          mensaje={
            filtro 
              ? (
                <span>
                  No encontramos resultados para <span className="font-bold break-all">"{filtro.length > 35 ? `${filtro.slice(0, 35)}...` : filtro}"</span>. Probá buscando con otras palabras clave o limpiá la búsqueda.
                </span>
              )
              : tabActiva === "mis_grupos"
                ? "Los grupos de estudio son ideales para debatir ejercicios prácticos, compartir apuntes y coordinar horarios de estudio."
                : "¡Sé el pionero y creá un nuevo grupo público para que se sumen compañeros de tu carrera!"
          }
          accionTexto={
            filtro 
              ? "Limpiar búsqueda" 
              : tabActiva === "mis_grupos"
                ? "+ Crear mi Primer Grupo"
                : "+ Crear Nuevo Grupo Público"
          }
          alHacerClic={() => {
            if (filtro) {
              setFiltro("");
            } else {
              setError("");
              setMensaje("");
              setModalAbierto(true);
            }
          }}
          botonSecundarioTexto={
            !filtro && tabActiva === "mis_grupos" ? "Explorar Grupos Públicos" : null
          }
          alHacerClicSecundario={
            !filtro && tabActiva === "mis_grupos"
              ? () => {
                  setTabActiva("explorar");
                  setFiltro("");
                }
              : null
          }
          className="my-6 py-12"
        />
      )}

      {/* MODAL: Crear Nuevo Grupo */}
      {modalAbierto && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden transform transition-all animate-slide-up">
            
            {/* Cabecera Modal */}
            <div className="px-6 py-4 bg-indigo-50/80 dark:bg-slate-800 border-b border-indigo-100 dark:border-slate-700 flex items-center justify-between transition-colors duration-200">
              <h2 className="text-sm font-bold text-indigo-900 dark:text-slate-100">Crear Grupo de Estudio</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 text-base font-semibold cursor-pointer border-none bg-transparent transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCrearGrupo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Nombre del Grupo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. TFI Álgebra - Comisión A"
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  maxLength={50}
                  required
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-colors duration-200 outline-none text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  placeholder="Describí el propósito del grupo, materias, horarios de reunión..."
                  value={descripcionNueva}
                  onChange={(e) => setDescripcionNueva(e.target.value)}
                  maxLength={250}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-colors duration-200 outline-none text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 resize-none"
                />
              </div>

              {/* Selector de Visibilidad (Tarjetas de Radio Premium) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Visibilidad del Grupo
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Tarjeta Público */}
                  <label 
                    onClick={() => setEstadoNuevo("publico")}
                    className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-colors duration-200 select-none ${
                      estadoNuevo === "publico" 
                        ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-600" 
                        : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1">
                        🌍 Público
                      </span>
                      <input 
                        type="radio" 
                        name="estado" 
                        value="publico" 
                        checked={estadoNuevo === "publico"}
                        onChange={() => {}}
                        className="accent-indigo-600 w-3.5 h-3.5 shrink-0"
                      />
                    </div>
                    <p className="text-[9.5px] text-gray-400 dark:text-slate-400 leading-normal">
                      Cualquier estudiante puede buscarlo, explorarlo y unirse directamente.
                    </p>
                  </label>

                  {/* Tarjeta Privado */}
                  <label 
                    onClick={() => setEstadoNuevo("privado")}
                    className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-colors duration-200 select-none ${
                      estadoNuevo === "privado" 
                        ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-600" 
                        : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1">
                        🔒 Privado
                      </span>
                      <input 
                        type="radio" 
                        name="estado" 
                        value="privado" 
                        checked={estadoNuevo === "privado"}
                        onChange={() => {}}
                        className="accent-indigo-600 w-3.5 h-3.5 shrink-0"
                      />
                    </div>
                    <p className="text-[9.5px] text-gray-400 dark:text-slate-400 leading-normal">
                      Sólo visible en 'Mis Grupos'. El ingreso es únicamente por invitación.
                    </p>
                  </label>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800 transition-colors duration-200">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 rounded-xl text-xs font-bold transition-colors duration-200 border border-gray-200 dark:border-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creando || !nombreNuevo.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors duration-200 shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer border-none"
                >
                  {creando ? "Creando..." : "Crear Grupo"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ListaGrupos;
