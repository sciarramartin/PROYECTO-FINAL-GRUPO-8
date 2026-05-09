import { useState } from "react";
import axios from "axios";

const Registro = () => {
    const [nombre, setNombre] =
        useState("");
    const [apellido, setApellido] =
        useState("");
    const [
        nombre_usuario,
        setNombreUsuario
    ] = useState("");
    const [mail, setMail] =
        useState("");
    const [contraseña, setContraseña] =
        useState("");
    const [
        confirmarContraseña,
        setConfirmarContraseña
    ] = useState("");
    const [id_carrera, setIdCarrera] =
        useState("");
    const [anio_ingreso, setAnioIngreso] =
        useState("");
    const [
        mostrarContraseña,
        setMostrarContraseña
    ] = useState(false);
    const [error, setError] =
        useState("");
    const [mensaje, setMensaje] =
        useState("");
    const [cargando, setCargando] =
        useState(false);
    const manejarRegistro = async () => {
        setError("");
        setMensaje("");
        if (
            !nombre ||
            !apellido ||
            !nombre_usuario ||
            !mail ||
            !contraseña ||
            !confirmarContraseña ||
            !id_carrera ||
            !anio_ingreso
        ) {

            setError(
                "Completá todos los campos"
            );
            return;
        }
        setCargando(true);
        try {
            await axios.post(
                "http://localhost:3000/api/auth/registro",
                {
                    nombre,
                    apellido,
                    nombre_usuario:
                        nombre_usuario,
                    mail,
                    contraseña,
                    confirmarContraseña,
                    id_carrera:
                        Number(id_carrera),
                    anio_ingreso:
                        Number(anio_ingreso)
                }
            );
            setMensaje(
                "Usuario registrado correctamente"
            );
            setTimeout(() => {
                window.location.href =
                    "/login";
            }, 2000);

        } catch (err) {
            setError(
                err.response?.data?.mensaje ||
                "Error al registrar usuario"
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 font-sans">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-10">

                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <span className="text-5xl mb-1">

                        🎓

                    </span>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">

                        Campus

                    </h1>
                </div>

                <h2 className="text-xl font-bold text-center text-gray-900 mb-1">

                    Registro de Usuario

                </h2>
                <p className="text-sm text-center text-gray-400 mb-7">

                    Creá tu cuenta para continuar

                </p>

                {/* Nombre */}
                <div className="mb-4">

                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Nombre
                    </label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) =>
                            setNombre(e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none"
                        placeholder="Tu nombre"
                    />
                </div>

                {/* Apellido */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">

                        Apellido

                    </label>
                    <input
                        type="text"
                        value={apellido}
                        onChange={(e) =>
                            setApellido(e.target.value)
                        }

                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none"
                        placeholder="Tu apellido"
                    />
                </div>

                {/* Username */}
                <div className="mb-4">

                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">

                        Nombre de usuario

                    </label>
                    <input
                        type="text"
                        value={nombre_usuario}
                        onChange={(e) =>
                            setNombreUsuario(
                                e.target.value
                            )
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none"
                        placeholder="usuario123"
                    />
                </div>

                {/* Mail */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">

                        Correo electrónico

                    </label>
                    <input
                        type="email"
                        value={mail}
                        onChange={(e) =>
                            setMail(e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none"
                        placeholder="correo@gmail.com"
                    />
                </div>

                {/* Contraseña */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">

                        Contraseña

                    </label>
                    <input
                        type={
                            mostrarContraseña
                                ? "text"
                                : "password"
                        }
                        value={contraseña}
                        onChange={(e) =>
                            setContraseña(
                                e.target.value
                            )
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none"
                        placeholder="********"
                    />
                </div>

                {/* Confirmar contraseña */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">

                        Confirmar contraseña

                    </label>
                    <input
                        type={
                            mostrarContraseña
                                ? "text"
                                : "password"
                        }
                        value={confirmarContraseña}
                        onChange={(e) =>
                            setConfirmarContraseña(
                                e.target.value
                            )
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none"
                        placeholder="********"
                    />
                </div>

                {/* Carrera */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">

                        Carrera

                    </label>
                    <select

                        value={id_carrera}
                        onChange={(e) =>
                            setIdCarrera(e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none"
                    >

                        <option value="">
                            Seleccioná una carrera
                        </option>

                        <option value="1">
                            Ingeniería en Sistemas
                         </option>

                        <option value="2">
                            Ingeniería Electrónica
                        </option>

                        <option value="3">
                            Ingeniería Industrial
                        </option>

                        <option value="4">
                            Ingeniería Mecánica
                        </option>

                        <option value="4">
                            Ingeniería Civil
                        </option>

                        <option value="4">
                            Ingeniería Química
                        </option>

                        <option value="4">
                            Ingeniería Eléctrica
                        </option>

                        <option value="4">
                            Ingeniería Metalúrgica
                        </option>
                    </select>
            
                </div>

                {/* Año */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">

                        Año de ingreso

                    </label>
                    <input
                        type="number"
                        value={anio_ingreso}
                        onChange={(e) =>
                            setAnioIngreso(
                                e.target.value
                            )
                        }

                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none"
                        placeholder="2024"
                    />
                </div>

                {/* Error */}
                {error && (
                    <p className="text-xs text-red-500 text-center mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">

                        {error}

                    </p>
                )}

                {/* Mensaje */}
                {mensaje && (
                    <p className="text-xs text-green-600 text-center mb-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">

                        {mensaje}

                    </p>
                )}

                {/* Botón */}
                <button
                    onClick={manejarRegistro}
                    disabled={cargando}
                    className="w-full py-3 text-white rounded-lg text-sm font-bold tracking-wide mb-5 bg-indigo-500 hover:bg-indigo-600 transition"
                >
                    {
                        cargando
                            ? "Registrando..."

                            : "CREAR CUENTA"
                    }

                </button>
                {/* Login */}

                <p className="text-center text-xs text-gray-400">
                    ¿Ya tenés cuenta?{" "}
                    <a
                        href="/login"
                        className="text-indigo-500 font-medium hover:underline"
                    >

                        Iniciá sesión

                    </a>
                </p>
            </div>
        </div>
    );
};

export default Registro;