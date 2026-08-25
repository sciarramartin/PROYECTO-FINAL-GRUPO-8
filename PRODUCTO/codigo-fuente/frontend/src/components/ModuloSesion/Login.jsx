import { useState, useEffect } from "react";
import axios from "axios";
import { useMostrarContraseña } from "./mostrarContrasena";

const Login = () => {
  const [mail, setMail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // y traemos el estado y la función directamente desde mostrarContrasena.js
  const { mostrarContraseña, alternarVisibilidad } = useMostrarContraseña();

  // Al cargar el componente, verificar si hay un mail guardado
  useEffect(() => {
    const mailGuardado = localStorage.getItem("mail_recordado");
    if (mailGuardado) {
      setMail(mailGuardado);
      setRecordarme(true);
    }
  }, []);

  const manejarLogin = async () => {
    setError("");

    if (!mail || !contraseña) {
      setError("Por favor completá todos los campos.");
      return;
    }

    setCargando(true);
    try {
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        mail,
        contraseña,
    });

      const { token, usuario } = respuesta.data;

      // Guardar o borrar el mail según el checkbox
      if (recordarme) {
        localStorage.setItem("mail_recordado", mail);
      } else {
        localStorage.removeItem("mail_recordado");
      }

      // El token siempre en sessionStorage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("usuario", JSON.stringify(usuario));

      const redirectPath = sessionStorage.getItem("redirect_despues_login") || "/dashboard";
      sessionStorage.removeItem("redirect_despues_login");
      window.location.href = redirectPath;
    } catch (err) {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 font-sans">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <span className="text-5xl mb-1">🎓</span>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Campus</h1>
          <p className="text-sm text-gray-400 mt-0.5">Plataforma Académica</p>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-1">Iniciar Sesión</h2>
        <p className="text-sm text-center text-gray-400 mb-7">Accedé a tu cuenta para continuar</p>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Correo electrónico
          </label>
          <div className="login-input-contenedor flex items-center border border-gray-200 rounded-lg px-3.5 py-2.5 bg-gray-50">
            <span className="text-gray-400 mr-2.5">✉</span>
            <input
              type="email"
              placeholder="tu@email.com"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Contraseña
          </label>
          <div className="login-input-contenedor flex items-center border border-gray-200 rounded-lg px-3.5 py-2.5 bg-gray-50">
            <span className="text-gray-400 mr-2.5">🔒</span>
            <input
              // 3. Sigue leyendo 'mostrarContraseña', pero ahora proviene de tu hook
              type={mostrarContraseña ? "text" : "password"}
              placeholder="Ingresá tu contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            />
            <span
              className="text-gray-400 ml-2 cursor-pointer select-none"
              // 4. CAMBIO AQUÍ: Ahora llama a la función reutilizable 'alternarVisibilidad'
              onClick={alternarVisibilidad}
            >
              {mostrarContraseña ? "🙈" : "👁"}
            </span>
          </div>
        </div>

        {/* Recordarme y olvidé contraseña */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={recordarme}
              onChange={(e) => setRecordarme(e.target.checked)}
            />
            Recordarme
          </label>
          <a href="/recuperar-contrasena" className="text-xs text-indigo-500 font-medium hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 text-center mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Botón */}
        <button
          onClick={manejarLogin}
          disabled={cargando}
          className="login-boton w-full py-3 text-white rounded-lg text-sm font-bold tracking-wide mb-5"
        >
          {cargando ? "Iniciando sesión..." : "INICIAR SESIÓN"}
        </button>

        {/* Registro */}
        <p className="text-center text-xs text-gray-400">
          ¿No tenés cuenta?{" "}
          <a href="/registro" className="text-indigo-500 font-medium hover:underline">
            Registrate
          </a>
        </p>

      </div>
    </div>
  );
};

export default Login;