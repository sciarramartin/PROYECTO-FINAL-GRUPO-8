import { useState } from "react";
import axios from "axios";

const RecuperarContrasena = () => {
  const [mail, setMail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async () => {
    setError("");

    if (!mail) {
      setError("Por favor ingresá tu correo electrónico.");
      return;
    }

    setCargando(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/recuperar-contrasena`, { mail });
      setEnviado(true);
    } catch (err) {
      setError("Error al procesar la solicitud. Intentá de nuevo.");
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

        {!enviado ? (
          <>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-1">
              Recuperar contraseña
            </h2>
            <p className="text-sm text-center text-gray-400 mb-7">
              Ingresá tu correo y te enviamos un link para resetear tu contraseña
            </p>

            {/* Email */}
            <div className="mb-5">
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

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 text-center mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Botón */}
            <button
              onClick={manejarEnvio}
              disabled={cargando}
              className="login-boton w-full py-3 text-white rounded-lg text-sm font-bold tracking-wide mb-5"
            >
              {cargando ? "Enviando..." : "ENVIAR LINK"}
            </button>
          </>
        ) : (
          // Pantalla de confirmación
          <div className="text-center py-4">
            <span className="text-5xl mb-4 block">📬</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Mail enviado!</h2>
            <p className="text-sm text-gray-400">
              Si tu correo está registrado, vas a recibir un link para resetear tu contraseña. Revisá también tu carpeta de spam.
            </p>
          </div>
        )}

        {/* Volver al login */}
        <p className="text-center text-xs text-gray-400">
          <a href="/login" className="text-indigo-500 font-medium hover:underline">
            ← Volver al inicio de sesión
          </a>
        </p>

      </div>
    </div>
  );
};

export default RecuperarContrasena;