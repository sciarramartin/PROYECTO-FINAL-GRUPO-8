import { useState } from "react";
import axios from "axios";

const ResetearContrasena = () => {
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [exitoso, setExitoso] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Obtener el token de la URL
  const token = new URLSearchParams(window.location.search).get("token");

  const manejarReset = async () => {
    setError("");

    if (!nuevaContraseña || !confirmarContraseña) {
      setError("Por favor completá todos los campos.");
      return;
    }

    if (nuevaContraseña !== confirmarContraseña) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!regex.test(nuevaContraseña)) {
      setError("La contraseña no cumple con los requisitos mínimos: debe tener al menos 6 caracteres, una letra mayúscula, un número y un carácter especial.");
      return;
    }

    if (!token) {
      setError("El link es inválido o expiró.");
      return;
    }

    setCargando(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/resetear-contrasena`, {
        token,
        nuevaContraseña,
      });
      setExitoso(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || "El link es inválido o expiró.");
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

        {!exitoso ? (
          <>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-1">
              Nueva contraseña
            </h2>
            <p className="text-sm text-center text-gray-400 mb-7">
              Ingresá tu nueva contraseña
            </p>

            {/* Nueva contraseña */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Nueva contraseña
              </label>
              <div className="login-input-contenedor flex items-center border border-gray-200 rounded-lg px-3.5 py-2.5 bg-gray-50">
                <span className="text-gray-400 mr-2.5">🔒</span>
                <input
                  type={mostrarContraseña ? "text" : "password"}
                  placeholder="Al menos 6 caracteres, 1 mayúscula, 1 número y 1 especial"
                  value={nuevaContraseña}
                  onChange={(e) => setNuevaContraseña(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                />
                <span
                  className="text-gray-400 ml-2 cursor-pointer select-none"
                  onClick={() => setMostrarContraseña(!mostrarContraseña)}
                >
                  {mostrarContraseña ? "🙈" : "👁"}
                </span>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="login-input-contenedor flex items-center border border-gray-200 rounded-lg px-3.5 py-2.5 bg-gray-50">
                <span className="text-gray-400 mr-2.5">🔒</span>
                <input
                  type={mostrarContraseña ? "text" : "password"}
                  placeholder="Repetí tu contraseña"
                  value={confirmarContraseña}
                  onChange={(e) => setConfirmarContraseña(e.target.value)}
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
              onClick={manejarReset}
              disabled={cargando}
              className="login-boton w-full py-3 text-white rounded-lg text-sm font-bold tracking-wide mb-5"
            >
              {cargando ? "Guardando..." : "GUARDAR CONTRASEÑA"}
            </button>
          </>
        ) : (
          // Pantalla de éxito
          <div className="text-center py-4">
            <span className="text-5xl mb-4 block">✅</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
            <p className="text-sm text-gray-400 mb-6">
              Tu contraseña fue cambiada correctamente. Ya podés iniciar sesión.
            </p>
            <a
              href="/login"
              className="login-boton inline-block px-6 py-3 text-white rounded-lg text-sm font-bold tracking-wide"
            >
              IR AL LOGIN
            </a>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetearContrasena;