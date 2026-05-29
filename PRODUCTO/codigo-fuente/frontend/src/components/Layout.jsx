import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FiGrid, 
  FiCompass, 
  FiBookOpen, 
  FiCalendar, 
  FiClock, 
  FiBarChart2, 
  FiSettings, 
  FiGitMerge, 
  FiPlusCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSun,
  FiMoon,
  FiChevronDown
} from "react-icons/fi";

const menuItems = [
  { label: "Dashboard", icon: <FiGrid />, path: "/dashboard" },
  { label: "Planificador", icon: <FiCompass />, path: "/planificador" },
  { label: "Materias", icon: <FiBookOpen />, path: "/materias" },
  { label: "Calendario", icon: <FiCalendar />, path: "/calendario" },
  { label: "Horario", icon: <FiClock />, path: "/Horario" },
  { label: "Reportes", icon: <FiBarChart2 />, path: "/reportes" },
  { label: "Ajustes", icon: <FiSettings />, path: "/ajustes" },
  { label: "Mapa Correlativas", icon: <FiGitMerge />, path: "/mapa-correlatividades", role: 1 },
  { label: "Registrar Correlativas", icon: <FiPlusCircle />, path: "/correlativas", role: 3 }
];

const Layout = ({ children }) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(() => {
    const guardado = localStorage.getItem("theme");
    if (guardado) return guardado === "dark";
    return false; // Modo claro (blanco) por defecto
  });

  const location = useLocation();
  const navigate = useNavigate();

  let usuario = {};
  try {
    const usuarioStr = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
    if (usuarioStr && usuarioStr !== "undefined") {
      usuario = JSON.parse(usuarioStr);
    }
  } catch (e) {
    console.error("Error parseando usuario:", e);
  }

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "US";

  // Efecto para sincronizar el tema con la clase del documentElement
  useEffect(() => {
    if (temaOscuro) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [temaOscuro]);

  const toggleTema = () => {
    setTemaOscuro(!temaOscuro);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col font-sans transition-colors duration-300">
      
      {/* HEADER TRANSPARENTE CON BLUR */}
      <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-4 md:px-6 fixed top-0 left-0 right-0 z-30 transition-colors duration-300">
        
        {/* Izquierda: Hamburguesa + Marca */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            aria-label="Abrir menú"
          >
            {sidebarAbierto ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <span className="text-xl font-bold">🎓</span>
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-none">Campus</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">Planificá tu cursada</p>
            </div>
          </div>
        </div>

        {/* Derecha: Acciones de usuario y tema */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Botón de Tema (Claro/Oscuro) */}
          <button 
            onClick={toggleTema}
            className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition duration-200"
            title={temaOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {temaOscuro ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          {/* Botón Notificaciones */}
          <button className="relative p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition duration-200">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-zinc-900" />
          </button>

          {/* Menú de Usuario */}
          <div className="relative">
            <button
              onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
              className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl p-1.5 transition duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-indigo-500/10">
                {iniciales}
              </div>
              <div className="hidden md:block text-left select-none max-w-[120px]">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-tight truncate">{usuario?.nombre || "Usuario"}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate mt-0.5">{usuario?.id_tipo_usuario === 3 ? "Administrador" : "Estudiante"}</p>
              </div>
              <FiChevronDown className={`text-zinc-400 w-3 h-3 transition-transform duration-200 ${menuUsuarioAbierto ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown del Menú de Usuario */}
            {menuUsuarioAbierto && (
              <>
                {/* Backdrop invisible para cerrar el menú haciendo clic fuera */}
                <div className="fixed inset-0 z-40" onClick={() => setMenuUsuarioAbierto(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 md:hidden">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{usuario?.nombre || "Usuario"}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{usuario?.id_tipo_usuario === 3 ? "Administrador" : "Estudiante"}</p>
                  </div>
                  <button
                    onClick={() => { cerrarSesion(); setMenuUsuarioAbierto(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2.5 font-medium transition"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">

        {/* OVERLAY oscuro en versión móvil */}
        {sidebarAbierto && (
          <div
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setSidebarAbierto(false)}
          />
        )}

        {/* SIDEBAR LATERAL */}
        <aside className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80
          flex flex-col justify-between z-20 transition-all duration-300
          ${sidebarAbierto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}>
          <nav className="p-3.5 flex flex-col gap-1.5 mt-2 overflow-y-auto max-h-[calc(100% - 4.5rem)]">
            {menuItems.filter(item => !item.role || item.role === usuario?.id_tipo_usuario).map((item) => {
              const activo = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarAbierto(false); }}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left relative group
                    ${activo
                      ? "bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }
                  `}
                >
                  {/* Borde activo en el extremo izquierdo */}
                  {activo && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-indigo-500 dark:bg-indigo-400" />
                  )}
                  <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${activo ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Botón inferior: Cerrar Sesión */}
          <div className="p-3.5 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 w-full text-left"
            >
              <FiLogOut className="text-lg" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* CONTENEDOR DE CONTENIDO PRINCIPAL */}
        <main className="flex-1 md:ml-60 p-4 md:p-8 min-h-full bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default Layout;