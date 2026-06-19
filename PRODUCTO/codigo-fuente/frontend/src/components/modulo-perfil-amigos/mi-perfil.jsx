// frontend/src/components/modulo-perfil-amigos/mi-perfil.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Avatares predefinidos (Emojis con fondos vibrantes en HSL)
const AVATARES_PREDEFINIDOS = [
  { emoji: "🎓", bg: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { emoji: "💻", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { emoji: "🔬", bg: "bg-amber-100 text-amber-700 border-amber-200" },
  { emoji: "🎨", bg: "bg-purple-100 text-purple-700 border-purple-200" },
  { emoji: "📚", bg: "bg-rose-100 text-rose-700 border-rose-200" },
  { emoji: "🌟", bg: "bg-sky-100 text-sky-700 border-sky-200" }
];

const AREAS_INTERES_OPCIONES = [
  "Inteligencia Artificial",
  "Ciberseguridad",
  "Desarrollo Mobile",
  "Desarrollo Web (Full Stack)",
  "Ciencia de Datos",
  "Diseño UX/UI",
  "Cloud Computing",
  "Desarrollo de Videojuegos",
  "Robótica",
  "Metodologías Ágiles"
];

const ROLES_EQUIPO = [
  "Programador",
  "Coordinador / Líder",
  "Documentador",
  "Diseñador UX/UI",
  "Analista de Requerimientos",
  "Tester / QA"
];

// Helper para traducir IDs de carreras a sus nombres oficiales
const CARRERAS = {
  1: "Ingeniería en Sistemas",
  2: "Ingeniería Electrónica",
  3: "Ingeniería Industrial",
  4: "Ingeniería Mecánica",
  5: "Ingeniería Civil",
  6: "Ingeniería Química",
  7: "Ingeniería Eléctrica",
  8: "Ingeniería Metalúrgica"
};

const MiPerfil = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // Estados de control
  const [editando, setEditando] = useState(false);
  const [carreras, setCarreras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Datos del Usuario (de la cuenta)
  const [usuarioInfo, setUsuarioInfo] = useState({
    nombre: "",
    apellido: "",
    mail: "",
    nombre_usuario: "",
    id_carrera: ""
  });

  // Datos del Perfil Académico
  const [perfilInfo, setPerfilInfo] = useState({
    apodo: "",
    anio_cursado: "",
    biografia: "",
    foto_perfil: "", // Guarda Base64 de la imagen o el emoji del avatar
    link_discord: "",
    link_telegram: "",
    link_whatsapp: "",
    link_github: "",
    link_linkedin: "",
    intereses: [], // Arreglo de strings
    rol_equipo: "",
    mostrar_anio_cursado: true,
    mostrar_contacto: true
  });

  // --- SUB-SECCIONES DE VISTA DE PERFIL ---
  const [seccionActiva, setSeccionActiva] = useState("info"); // "info" o "foro"
  const [actividadForo, setActividadForo] = useState({ publicaciones: [], comentarios: [] });
  const [cargandoActividad, setCargandoActividad] = useState(true);
  const [tabActiva, setTabActiva] = useState("publicaciones"); // "publicaciones" o "comentarios"

  const cargarActividadForo = async () => {
    try {
      setCargandoActividad(true);
      const response = await fetch("http://localhost:3000/api/perfiles/mi-perfil/foro-actividad", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setActividadForo(data);
      }
    } catch (err) {
      console.error("Error al cargar la actividad del foro:", err);
    } finally {
      setCargandoActividad(false);
    }
  };

  useEffect(() => {
    if (seccionActiva === "foro") {
      cargarActividadForo();
    }
  }, [seccionActiva]);

  // Carga inicial
  const inicializarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      
      // 1. Cargar lista de carreras
      const carrerasRes = await axios.get(`${apiUrl}/carreras`);
      setCarreras(carrerasRes.data);

      // 2. Cargar perfil propio del estudiante
      const perfilRes = await axios.get(`${apiUrl}/perfiles/mi-perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { usuario, perfil } = perfilRes.data;

      // Setear info de usuario
      setUsuarioInfo({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        mail: usuario.mail || "",
        nombre_usuario: usuario.nombre_usuario || "",
        id_carrera: usuario.id_carrera || ""
      });

      // Setear info de perfil
      let interesesArray = [];
      try {
        interesesArray = JSON.parse(perfil.intereses || "[]");
      } catch (e) {
        interesesArray = [];
      }

      setPerfilInfo({
        apodo: perfil.apodo || "",
        anio_cursado: perfil.anio_cursado || "",
        biografia: perfil.biografia || "",
        foto_perfil: perfil.foto_perfil || "",
        link_discord: perfil.link_discord || "",
        link_telegram: perfil.link_telegram || "",
        link_whatsapp: perfil.link_whatsapp || "",
        link_github: perfil.link_github || "",
        link_linkedin: perfil.link_linkedin || "",
        intereses: interesesArray,
        rol_equipo: perfil.rol_equipo || "",
        mostrar_anio_cursado: perfil.mostrar_anio_cursado !== false,
        mostrar_contacto: perfil.mostrar_contacto !== false
      });

    } catch (err) {
      console.error("Error al cargar perfil propio:", err);
      setError("Ocurrió un error al obtener la información de tu perfil académico.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    inicializarDatos();
  }, [token]);

  // Manejar cambio en inputs de texto estándar
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPerfilInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio en checkboxes (privacidad)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setPerfilInfo((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  // Toggle de áreas de interés (Píldoras)
  const handleInteresToggle = (interes) => {
    setPerfilInfo((prev) => {
      const existe = prev.intereses.includes(interes);
      let nuevosIntereses = [];
      if (existe) {
        nuevosIntereses = prev.intereses.filter((i) => i !== interes);
      } else {
        nuevosIntereses = [...prev.intereses, interes];
      }
      return {
        ...prev,
        intereses: nuevosIntereses
      };
    });
  };

  // Subir archivo e imagen (Conversión a Base64)
  const handleImagenUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, subí únicamente archivos de imagen.");
      return;
    }

    // Validar tamaño máximo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen supera el límite de 2MB. Intentá con una más liviana.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPerfilInfo((prev) => ({
        ...prev,
        foto_perfil: reader.result // El base64 final
      }));
      setError("");
    };
    reader.readAsDataURL(file);
  };

  // Seleccionar un avatar emoji predefinido
  const handleSelectAvatarEmoji = (emoji) => {
    setPerfilInfo((prev) => ({
      ...prev,
      foto_perfil: emoji
    }));
  };

  // Guardar cambios en el backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setMensaje("");

    // Validar caracteres estrictos de biografía
    if (perfilInfo.biografia.length > 250) {
      setError("La biografía no puede superar los 250 caracteres.");
      setGuardando(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      
      const payload = {
        ...perfilInfo,
        id_carrera: Number(usuarioInfo.id_carrera) // Guardamos la carrera en el Usuario
      };

      await axios.put(`${apiUrl}/perfiles/mi-perfil`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensaje("¡Perfil académico actualizado con éxito!");
      
      // Actualizar localStorage/sessionStorage del usuario si cambió la carrera
      const sessionUser = JSON.parse(sessionStorage.getItem("usuario") || localStorage.getItem("usuario") || "{}");
      sessionUser.id_carrera = Number(usuarioInfo.id_carrera);
      if (sessionStorage.getItem("usuario")) {
        sessionStorage.setItem("usuario", JSON.stringify(sessionUser));
      } else {
        localStorage.setItem("usuario", JSON.stringify(sessionUser));
      }

      setEditando(false); // Salir de modo edición y volver a la vista del perfil!
      await inicializarDatos(); // Recargar datos frescos del backend

      // Desplazarse arriba para ver el mensaje de confirmación
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error("Error al guardar cambios de perfil:", err);
      setError(err.response?.data?.error || "Error al sincronizar tus cambios.");
    } finally {
      setGuardando(false);
    }
  };

  // Cancelar edición y revertir datos
  const handleCancelar = async () => {
    setEditando(false);
    setError("");
    setMensaje("");
    await inicializarDatos(); // Revertir a datos del backend
  };

  // Renderizar la foto de perfil en la vista previa
  const renderFoto = (foto, nombreCompleto, sizeClass = "w-20 h-20 text-2xl") => {
    if (!foto) {
      const iniciales = nombreCompleto
        ? nombreCompleto.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "US";
      return (
        <div className={`${sizeClass} rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black shrink-0`}>
          {iniciales}
        </div>
      );
    }

    if (foto.length <= 4) {
      const emojiSize = sizeClass.includes("w-28") ? "text-5xl" : "text-4xl";
      return (
        <div className={`${sizeClass} rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm ${emojiSize}`}>
          {foto}
        </div>
      );
    }

    return (
      <img
        src={foto}
        alt="Foto de perfil"
        className={`${sizeClass} rounded-full object-cover border border-gray-200 shadow-sm shrink-0`}
      />
    );
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 font-medium">Cargando tus datos académicos...</p>
      </div>
    );
  }

  const nombreCompleto = `${usuarioInfo.nombre} ${usuarioInfo.apellido}`;
  const caracRestantes = 250 - perfilInfo.biografia.length;



  const renderInfoAcademica = () => {
    return (
      <div className="p-6 space-y-6">
        
        {/* Grilla Académica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Año de Cursado</h4>
            <p className="text-sm font-bold text-gray-800 text-left">
              {perfilInfo.anio_cursado ? `${perfilInfo.anio_cursado}° Año` : "No definido"}
              {!perfilInfo.mostrar_anio_cursado && (
                <span className="text-[9px] bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded-md ml-2 inline-block">
                  Oculto a otros
                </span>
              )}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rol Preferido en Equipos</h4>
            <p className="text-sm font-bold text-indigo-600 text-left">
              {perfilInfo.rol_equipo || "No definido"}
            </p>
          </div>
        </div>

        {/* Biografía */}
        {perfilInfo.biografia ? (
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Biografía</h4>
            <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-4 italic leading-relaxed break-words">
              "{perfilInfo.biografia}"
            </p>
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
            <p className="text-xs text-gray-400">Aún no redactaste una biografía personal. Hacé clic en "Editar Perfil" para agregarla.</p>
          </div>
        )}

        {/* Áreas de Interés */}
        {perfilInfo.intereses.length > 0 && (
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Áreas de Interés de Estudio</h4>
            <div className="flex flex-wrap gap-2">
              {perfilInfo.intereses.map((int, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-bold"
                >
                  {int}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Redes y Canales de Contacto */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Canales de Contacto y Redes</h4>
            {!perfilInfo.mostrar_contacto && (
              <span className="text-[9px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded-full">
                Oculto a otros
              </span>
            )}
          </div>

          {(!perfilInfo.link_discord && !perfilInfo.link_telegram && !perfilInfo.link_whatsapp && !perfilInfo.link_github && !perfilInfo.link_linkedin) ? (
            <p className="text-xs text-gray-400 italic text-left">No agregaste enlaces de contacto todavía.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Discord */}
              {perfilInfo.link_discord && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 text-xs">
                  <span className="text-base">🎮</span>
                  <span className="text-gray-500 font-semibold truncate">Discord: <strong className="text-gray-800">{perfilInfo.link_discord}</strong></span>
                </div>
              )}

              {/* Telegram */}
              {perfilInfo.link_telegram && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 text-xs">
                  <span className="text-base">✈️</span>
                  <span className="text-gray-500 font-semibold truncate">Telegram: <strong className="text-gray-800">{perfilInfo.link_telegram}</strong></span>
                </div>
              )}

              {/* WhatsApp */}
              {perfilInfo.link_whatsapp && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 text-xs">
                  <span className="text-base">💬</span>
                  <span className="text-gray-500 font-semibold truncate">WhatsApp: <strong className="text-gray-800">{perfilInfo.link_whatsapp}</strong></span>
                </div>
              )}

              {/* GitHub */}
              {perfilInfo.link_github && (
                <a
                  href={perfilInfo.link_github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl p-3 flex items-center justify-between text-xs text-gray-600 font-bold transition group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🐙</span> GitHub Profesional
                  </span>
                  <span className="text-gray-400 group-hover:text-gray-700 transition">➔</span>
                </a>
              )}

              {/* LinkedIn */}
              {perfilInfo.link_linkedin && (
                <a
                  href={perfilInfo.link_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl p-3 flex items-center justify-between text-xs text-gray-600 font-bold transition group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">💼</span> LinkedIn Profesional
                  </span>
                  <span className="text-gray-400 group-hover:text-gray-700 transition">➔</span>
                </a>
              )}

            </div>
          )}
        </div>

      </div>
    );
  };

  const renderActividadForo = () => {
    return (
      <div className="p-6 space-y-6 bg-gray-50/20">
        {/* Selector de sub-pestañas para publicaciones y comentarios */}
        <div className="flex bg-white rounded-xl p-1 border border-gray-150 max-w-sm mx-auto shadow-sm">
          <button
            type="button"
            onClick={() => setTabActiva("publicaciones")}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
              tabActiva === "publicaciones"
                ? "text-white bg-indigo-600 shadow-sm font-extrabold"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            📝 Publicaciones ({actividadForo.publicaciones.length})
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("comentarios")}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
              tabActiva === "comentarios"
                ? "text-white bg-indigo-600 shadow-sm font-extrabold"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            💬 Comentarios ({actividadForo.comentarios.length})
          </button>
        </div>

        {/* Contenido de la sub-pestaña */}
        <div className="max-h-[400px] overflow-y-auto pr-1.5">
          {cargandoActividad ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-[10px] text-gray-400 font-medium">Cargando actividad...</p>
            </div>
          ) : tabActiva === "publicaciones" ? (
            actividadForo.publicaciones.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                <span className="text-3xl block mb-2">📬</span>
                <p className="text-xs text-gray-400 font-medium">Aún no publicó ninguna duda o aporte.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actividadForo.publicaciones.map((pub) => {
                  const fecha = new Date(pub.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  return (
                    <div
                      key={pub.id}
                      onClick={() => navigate(`/foros/${pub.id_materia}/publicacion/${pub.id}`)}
                      className="group p-4 bg-white hover:bg-indigo-50/30 border border-gray-150 hover:border-indigo-150 rounded-xl transition duration-200 cursor-pointer flex flex-col gap-3 shadow-sm hover:shadow-md text-left"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                            {pub.Materia?.nombre || pub.materium?.nombre || pub.materia?.nombre || "Foro"}
                          </span>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          pub.categoria === "Duda"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : pub.categoria === "Recurso"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : pub.categoria === "Opinión"
                            ? "bg-purple-50 text-purple-600 border border-purple-100"
                            : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                        }`}>
                          {pub.categoria || "General"}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition leading-snug">
                        {pub.titulo}
                      </h4>

                      <p className="text-[11px] text-gray-455 line-clamp-2 leading-relaxed">
                        {pub.contenido}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 pt-2 border-t border-gray-150/50">
                        <div className="flex items-center gap-1">
                          <span>👍</span>
                          <span className="font-bold text-gray-500">{pub.votos || 0} {pub.votos === 1 ? "voto" : "votos"}</span>
                        </div>
                        <span>{fecha}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            actividadForo.comentarios.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                <span className="text-3xl block mb-2">💬</span>
                <p className="text-xs text-gray-400 font-medium">Aún no realizó comentarios en los foros.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actividadForo.comentarios.map((com) => {
                  const fecha = new Date(com.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  const materiaId = com.ForoPublicacion?.id_materia;
                  const postId = com.ForoPublicacion?.id;
                  return (
                    <div
                      key={com.id}
                      onClick={() => {
                        if (materiaId && postId) {
                          navigate(`/foros/${materiaId}/publicacion/${postId}`);
                        }
                      }}
                      className="group p-4 bg-white hover:bg-indigo-50/30 border border-gray-150 hover:border-indigo-150 rounded-xl transition duration-200 cursor-pointer flex flex-col gap-2.5 shadow-sm hover:shadow-md text-left"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                            {com.ForoPublicacion?.Materia?.nombre || com.ForoPublicacion?.materium?.nombre || com.ForoPublicacion?.materia?.nombre || "Foro"}
                          </span>
                          <span className="text-[10px] text-gray-455 font-semibold truncate max-w-[200px]">
                            En respuesta a: "{com.ForoPublicacion?.titulo || "Publicación"}"
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-605 bg-gray-50/70 p-2.5 rounded-lg border border-gray-150/45 italic leading-relaxed break-words">
                        "{com.contenido}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 pt-1">
                        <div className="flex items-center gap-1">
                          <span>👍</span>
                          <span className="font-bold text-gray-500">{com.votos || 0} {com.votos === 1 ? "voto" : "votos"}</span>
                        </div>
                        <span>{fecha}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // --- VISTA DE PERFIL (Por defecto, Lectura limpia con botón de Editar) ---
  if (!editando) {
    return (
      <div className="max-w-3xl mx-auto px-4 mt-6">
        
        {/* Alerta de guardado exitoso */}
        {mensaje && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-xs mb-4 animate-fade-in flex items-center gap-2">
            <span>✓</span> {mensaje}
          </div>
        )}

        {/* Tarjeta de Perfil Académico (Estilo Mis Conexiones) */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
          
          {/* Cabecera de Identidad */}
          <div className="bg-gray-50 border-b border-gray-150 p-6 flex flex-col md:flex-row items-center gap-5">
            {renderFoto(perfilInfo.foto_perfil, nombreCompleto, "w-24 h-24 text-3xl")}
            
            <div className="text-center md:text-left min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight truncate text-left">
                {nombreCompleto}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1.5">
                <span className="text-xs text-gray-400">@{usuarioInfo.nombre_usuario}</span>
                {perfilInfo.apodo && (
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                    "{perfilInfo.apodo}"
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-left">
                🎓 Carrera Oficial: <span className="font-semibold text-gray-700">{CARRERAS[usuarioInfo.id_carrera] || "No seleccionada"}</span>
              </p>
            </div>

            {/* Botón Editar en Esquina Superior Derecha */}
            <button
              onClick={() => setEditando(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer border-none flex items-center gap-1.5"
            >
              ⚙️ Editar Perfil
            </button>
          </div>

          {/* Selector de Sección Principal (Tabs) */}
          <div className="flex border-b border-gray-150 bg-white">
            <button
              type="button"
              onClick={() => setSeccionActiva("info")}
              className={`flex-1 py-3 text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
                seccionActiva === "info"
                  ? "text-indigo-600 border-b-2 border-indigo-600 font-extrabold"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/10"
              }`}
            >
              👤 Información Académica
            </button>
            <button
              type="button"
              onClick={() => setSeccionActiva("foro")}
              className={`flex-1 py-3 text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
                seccionActiva === "foro"
                  ? "text-indigo-600 border-b-2 border-indigo-600 font-extrabold"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/10"
              }`}
            >
              💬 Actividad del Foro
            </button>
          </div>

          {/* Renderizado Condicional de la Sección Activa */}
          {seccionActiva === "info" ? renderInfoAcademica() : renderActividadForo()}

        </div>

      </div>
    );
  }

  // --- MODO EDICIÓN (Se activa al hacer clic en Editar Perfil) ---
  return (
    <div className="max-w-6xl mx-auto px-2">
      
      {/* Cabecera de Página */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Configurar Perfil Académico</h1>
          <p className="text-xs text-gray-400 mt-1">
            Personalizá tu identidad, enlaces académicos y opciones de privacidad.
          </p>
        </div>
        <button
          onClick={handleCancelar}
          className="px-4 py-2 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          ✕ Cancelar
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 rounded-xl px-4 py-3 text-xs mb-4 max-w-xl animate-fade-in flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Grid Principal: Vista Previa a la izquierda, Formulario a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA 1: VISTA PREVIA */}
        <div className="lg:col-span-1 bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-5 lg:sticky lg:top-20">
          <div className="text-center pb-4 border-b border-gray-100 flex flex-col items-center">
            {renderFoto(perfilInfo.foto_perfil, nombreCompleto, "w-20 h-20 text-2xl")}
            
            <h3 className="text-base font-bold text-gray-900 mt-3 leading-tight">
              {nombreCompleto}
            </h3>
            {perfilInfo.apodo && (
              <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
                "{perfilInfo.apodo}"
              </p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">@{usuarioInfo.nombre_usuario}</p>
          </div>

          {/* Información Académica en Vista Previa */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Académico</h4>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1.5 text-xs text-gray-500">
              <p>
                <strong className="text-gray-400">Carrera:</strong>{" "}
                {carreras.find((c) => c.id === Number(usuarioInfo.id_carrera))?.nombre || "No seleccionada"}
              </p>
              
              <p className={`flex items-center gap-1.5 ${!perfilInfo.mostrar_anio_cursado ? "text-gray-300 italic" : ""}`}>
                <strong className="text-gray-400">Año de cursado:</strong>{" "}
                {perfilInfo.anio_cursado ? `${perfilInfo.anio_cursado}° Año` : "No definido"}{" "}
                {!perfilInfo.mostrar_anio_cursado && <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 rounded-md">Oculto a terceros</span>}
              </p>

              {perfilInfo.rol_equipo && (
                <p>
                  <strong className="text-gray-400">Rol preferido:</strong>{" "}
                  <span className="font-semibold text-indigo-600">{perfilInfo.rol_equipo}</span>
                </p>
              )}
            </div>
          </div>

          {/* Biografía en Vista Previa */}
          {perfilInfo.biografia && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Biografía</h4>
              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-3 italic leading-relaxed break-words">
                "{perfilInfo.biografia}"
              </p>
            </div>
          )}

          {/* Intereses en Vista Previa */}
          {perfilInfo.intereses.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Áreas de Interés</h4>
              <div className="flex flex-wrap gap-1.5">
                {perfilInfo.intereses.map((int, i) => (
                  <span key={i} className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                    {int}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Canales de Contacto en Vista Previa */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Canales de Contacto</h4>
            
            {!perfilInfo.mostrar_contacto ? (
              <p className="text-[10px] text-gray-400 italic bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3 text-center">
                🔒 Tus datos de contacto están configurados como ocultos para otros compañeros.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {perfilInfo.link_discord && (
                  <span className="bg-gray-50 border border-gray-100 rounded-lg p-1.5 truncate text-gray-600">
                    🎮 Discord: {perfilInfo.link_discord}
                  </span>
                )}
                {perfilInfo.link_telegram && (
                  <span className="bg-gray-50 border border-gray-100 rounded-lg p-1.5 truncate text-gray-600">
                    ✈️ Telegram: {perfilInfo.link_telegram}
                  </span>
                )}
                {perfilInfo.link_whatsapp && (
                  <span className="bg-gray-50 border border-gray-100 rounded-lg p-1.5 truncate text-gray-600">
                    💬 WhatsApp: {perfilInfo.link_whatsapp}
                  </span>
                )}
                {perfilInfo.link_github && (
                  <span className="bg-gray-50 border border-gray-100 rounded-lg p-1.5 truncate text-gray-600">
                    🐙 GitHub
                  </span>
                )}
                {perfilInfo.link_linkedin && (
                  <span className="bg-gray-50 border border-gray-100 rounded-lg p-1.5 truncate text-gray-600">
                    💼 LinkedIn
                  </span>
                )}
                {!perfilInfo.link_discord && !perfilInfo.link_telegram && !perfilInfo.link_whatsapp && !perfilInfo.link_github && !perfilInfo.link_linkedin && (
                  <p className="col-span-2 text-gray-400 italic">No agregaste canales aún.</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* COLUMNA 2 Y 3: FORMULARIO DE EDICIÓN */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* SECCIÓN 1: IDENTIDAD Y FOTO */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">1. Identidad y Avatar</h3>
              
              {/* Selector de Avatar */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Seleccioná tu Avatar de la comunidad</label>
                <div className="flex flex-wrap items-center gap-3">
                  {AVATARES_PREDEFINIDOS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAvatarEmoji(avatar.emoji)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border transition hover:scale-110 cursor-pointer ${avatar.bg} ${
                        perfilInfo.foto_perfil === avatar.emoji ? "ring-2 ring-indigo-600 scale-105" : ""
                      }`}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                  
                  {/* Subir archivo */}
                  <div className="relative">
                    <input
                      type="file"
                      id="upload-file"
                      accept="image/*"
                      onChange={handleImagenUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="upload-file"
                      className="px-3 py-2 border border-dashed border-gray-300 hover:border-indigo-500 rounded-xl text-xs font-bold text-gray-500 hover:text-indigo-600 cursor-pointer flex items-center gap-1.5 transition"
                    >
                      📷 Subir foto
                    </label>
                  </div>
                </div>
              </div>

              {/* Fila Nombre, Apellido, Apodo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={nombreCompleto}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-400 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Apodo (Nombre de visualización)</label>
                  <input
                    type="text"
                    name="apodo"
                    placeholder="Ej. Fran, Martin"
                    value={perfilInfo.apodo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS ACADÉMICOS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">2. Datos Académicos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selector Carrera */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Carrera Oficial</label>
                  <select
                    value={usuarioInfo.id_carrera}
                    onChange={(e) => setUsuarioInfo(prev => ({ ...prev, id_carrera: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                  >
                    <option value="">Selecciona tu carrera...</option>
                    {carreras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector Año de Cursado */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Año de cursado actual</label>
                  <select
                    name="anio_cursado"
                    value={perfilInfo.anio_cursado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                  >
                    <option value="">Selecciona tu año actual...</option>
                    <option value="1">1° Año (Ingresante)</option>
                    <option value="2">2° Año</option>
                    <option value="3">3° Año</option>
                    <option value="4">4° Año</option>
                    <option value="5">5° Año</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: BIOGRAFÍA */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold text-gray-900">3. Biografía Personal</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${caracRestantes < 20 ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}>
                  {caracRestantes} / 250 restantes
                </span>
              </div>

              <div>
                <textarea
                  name="biografia"
                  placeholder="Redactá una breve biografía personal. Contale a tus compañeros qué te gusta estudiar, tus materias favoritas, hobbies o proyectos..."
                  value={perfilInfo.biografia}
                  onChange={handleInputChange}
                  maxLength={250}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none resize-none transition"
                />
                <p className="text-[10px] text-gray-400 mt-1">Límite estricto de 250 caracteres.</p>
              </div>
            </div>

            {/* SECCIÓN 4: INTERESES Y ROLES */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">4. Perfil de Colaboración</h3>
              
              {/* Rol preferido */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Rol preferido en trabajos en equipo</label>
                <select
                  name="rol_equipo"
                  value={perfilInfo.rol_equipo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                >
                  <option value="">Selecciona tu rol habitual...</option>
                  {ROLES_EQUIPO.map((rol, idx) => (
                    <option key={idx} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Áreas de interés */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Áreas de interés de estudio</label>
                <div className="flex flex-wrap gap-2">
                  {AREAS_INTERES_OPCIONES.map((interes, idx) => {
                    const seleccionado = perfilInfo.intereses.includes(interes);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleInteresToggle(interes)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer border ${
                          seleccionado
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {seleccionado ? "✓ " : "+ "} {interes}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: PLATAFORMAS DE CONTACTO */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">5. Canales de Contacto y Enlaces</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">🎮 Discord Tag/Usuario</label>
                  <input
                    type="text"
                    name="link_discord"
                    placeholder="Ej. usuario#1234"
                    value={perfilInfo.link_discord}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">✈️ Usuario de Telegram</label>
                  <input
                    type="text"
                    name="link_telegram"
                    placeholder="Ej. @miusuario"
                    value={perfilInfo.link_telegram}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">💬 Celular / WhatsApp</label>
                  <input
                    type="text"
                    name="link_whatsapp"
                    placeholder="Ej. +54911223344"
                    value={perfilInfo.link_whatsapp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">🐙 Perfil de GitHub (URL)</label>
                  <input
                    type="url"
                    name="link_github"
                    placeholder="https://github.com/tu-usuario"
                    value={perfilInfo.link_github}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">💼 Perfil de LinkedIn (URL)</label>
                  <input
                    type="url"
                    name="link_linkedin"
                    placeholder="https://linkedin.com/in/tu-perfil"
                    value={perfilInfo.link_linkedin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 6: PRIVACIDAD */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">6. Opciones de Privacidad</h3>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-xl cursor-pointer hover:bg-gray-100/50 transition">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-gray-800">Mostrar Año de Cursado</p>
                    <p className="text-[10px] text-gray-400">Si lo desactivás, otros alumnos no podrán ver en qué año de la carrera estás cursando.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="mostrar_anio_cursado"
                    checked={perfilInfo.mostrar_anio_cursado}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 accent-indigo-600 shrink-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-xl cursor-pointer hover:bg-gray-100/50 transition">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-gray-800">Mostrar Canales de Contacto</p>
                    <p className="text-[10px] text-gray-400">Desactivalo si preferís ocultar tus usuarios de Discord, Telegram y WhatsApp a los demás miembros.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="mostrar_contacto"
                    checked={perfilInfo.mostrar_contacto}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 accent-indigo-600 shrink-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* BOTONES ACCIÓN FORMULARIO */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelar}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer border-none"
              >
                {guardando ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default MiPerfil;
