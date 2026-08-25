import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiDownload, FiFile, FiStar } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function obtenerToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// Detecta qué tipo de viewer usar según la extensión del archivo
function tipoDeArchivo(ubicacion = "") {
    const ext = ubicacion.split(".").pop().toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "imagen";
    return "otro";
}

function badgeClase(tipo) {
    if (tipo === "pdf") return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    if (tipo === "imagen") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
}

const MuroMaterialEstudio = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [material, setMaterial] = useState(null);
    const [blobUrl, setBlobUrl] = useState(null);
    const [tipo, setTipo] = useState("otro");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estados para la calificación
    const [hoverEstrella, setHoverEstrella] = useState(0);
    const [miPuntuacion, setMiPuntuacion] = useState(0);
    const [promedio, setPromedio] = useState(0);
    const [totalVotos, setTotalVotos] = useState(0);
    const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);

    useEffect(() => {
        let url = null;

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const token = obtenerToken();
                const headers = { Authorization: `Bearer ${token}` };

                // 1️⃣ Metadata
                const resMeta = await axios.get(`${API_BASE}/repositorio/${id}`, { headers });
                const meta = resMeta.data;
                setMaterial(meta);

                // Cargar datos de calificación si vienen en la respuesta
                setPromedio(meta.promedioCalificacion || 0);
                setTotalVotos(meta.totalVotos || 0);

                const tipoDetectado = tipoDeArchivo(meta.ubicacion);
                setTipo(tipoDetectado);

                // 2️⃣ Binario para el visor
                if (tipoDetectado === "pdf" || tipoDetectado === "imagen") {
                    const resBlob = await axios.get(`${API_BASE}/repositorio/${id}/descargar`, {
                        headers,
                        responseType: "blob"
                    });
                    url = URL.createObjectURL(resBlob.data);
                    setBlobUrl(url);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        }

        cargar();
        return () => { if (url) URL.revokeObjectURL(url); };
    }, [id]);

    // Función para registrar la calificación en la API
    async function handleCalificar(puntuacion) {
        if (enviandoCalificacion) return;
        setEnviandoCalificacion(true);

        try {
            const token = obtenerToken();
            const res = await axios.post(
                `${API_BASE}/repositorio/${id}/calificar`,
                { idMaterial: Number(id), puntuacion },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Actualizamos los estados locales con los nuevos valores recibidos de la API
            setMiPuntuacion(puntuacion);
            if (res.data?.promedio !== undefined) {
                setPromedio(res.data.promedio);
                setTotalVotos(res.data.totalVotos);
            }
        } catch (err) {
            console.error("Error al registrar calificación:", err);
            alert("No se pudo registrar tu calificación");
        } finally {
            setEnviandoCalificacion(false);
        }
    }

    // Descarga forzada
    async function handleDescargar() {
        try {
            const token = obtenerToken();
            const res = await axios.get(`${API_BASE}/repositorio/${id}/descargar`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = material?.titulo || "archivo";
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("No se pudo descargar el archivo");
        }
    }

    // ── Skeleton ────────────────────────────────────────────────────────────────
    if (cargando) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded mb-6" />
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="h-5 w-56 bg-zinc-200 dark:bg-zinc-700 rounded mb-3" />
                        <div className="flex gap-2">
                            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                        </div>
                    </div>
                    <div className="h-[500px] bg-zinc-100 dark:bg-zinc-800" />
                </div>
            </div>
        );
    }

    // ── Error ───────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-6">
                    <FiArrowLeft /> Volver
                </button>
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl p-6 text-sm">
                    {error}
                </div>
            </div>
        );
    }

    const etiquetas = Array.isArray(material?.etiquetas) ? material.etiquetas : [];
    const fechaFormateada = material?.fechaPublicacion || material?.fecha_de_publicacion
        ? new Date(material.fechaPublicacion || material.fecha_de_publicacion).toLocaleDateString("es-AR", {
            day: "numeric", month: "short", year: "numeric"
        })
        : "";

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Botón volver */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-6 transition"
            >
                <FiArrowLeft /> volver al repositorio
            </button>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">

                {/* Header con metadata y calificaciones */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 truncate">
                            {material?.titulo}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Badge tipo archivo */}
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeClase(tipo)}`}>
                                {tipo.toUpperCase()}
                            </span>

                            {/* Etiquetas */}
                            {etiquetas.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                                >
                                    {tag}
                                </span>
                            ))}

                            {/* Fecha */}
                            {fechaFormateada && (
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                    {fechaFormateada}
                                </span>
                            )}
                        </div>

                        {/* ── SECCIÓN DE CALIFICACIÓN Y ESTRELLAS ── */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                Calificar:
                            </span>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((estrella) => (
                                    <button
                                        key={estrella}
                                        disabled={enviandoCalificacion}
                                        onClick={() => handleCalificar(estrella)}
                                        onMouseEnter={() => setHoverEstrella(estrella)}
                                        onMouseLeave={() => setHoverEstrella(0)}
                                        className="p-0.5 text-lg transition-transform active:scale-125 disabled:opacity-50"
                                        title={`Calificar con ${estrella} estrella${estrella > 1 ? 's' : ''}`}
                                    >
                                        <FiStar
                                            className={`${
                                                estrella <= (hoverEstrella || miPuntuacion)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-zinc-300 dark:text-zinc-600"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                    {promedio} ★
                                </span>{" "}
                                ({totalVotos} {totalVotos === 1 ? "voto" : "votos"})
                            </div>
                        </div>
                    </div>

                    {/* Botón descargar */}
                    <button
                        onClick={handleDescargar}
                        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition shrink-0 self-start md:self-center"
                    >
                        <FiDownload className="w-4 h-4" /> Descargar
                    </button>
                </div>

                {/* Zona del viewer */}
                <div className="bg-zinc-50 dark:bg-zinc-950 min-h-[500px] flex items-center justify-center">

                    {tipo === "pdf" && blobUrl && (
                        <iframe
                            src={blobUrl}
                            title={material?.titulo}
                            className="w-full h-[600px] border-none"
                        />
                    )}

                    {tipo === "imagen" && blobUrl && (
                        <img
                            src={blobUrl}
                            alt={material?.titulo}
                            className="max-w-full max-h-[600px] object-contain p-6"
                        />
                    )}

                    {tipo === "otro" && (
                        <div className="text-center py-16 px-8">
                            <FiFile className="w-14 h-14 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                                Este tipo de archivo no tiene previsualización disponible.
                            </p>
                            <button
                                onClick={handleDescargar}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
                            >
                                <FiDownload className="w-4 h-4" /> Descargar archivo
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MuroMaterialEstudio;