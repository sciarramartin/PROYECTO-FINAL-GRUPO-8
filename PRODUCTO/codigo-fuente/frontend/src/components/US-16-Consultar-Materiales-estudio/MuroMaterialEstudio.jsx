import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiDownload, FiFile, FiStar, FiLoader } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function obtenerToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function tipoDeArchivo(ubicacion = "") {
    const ext = ubicacion.split(".").pop().toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "imagen";
    return "otro";
}

function badgeClase(tipo) {
    if (tipo === "pdf") return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
    if (tipo === "imagen") return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
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
    const [descargando, setDescargando] = useState(false);

    // Estados para la calificación con estrellas
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

                const resMeta = await axios.get(`${API_BASE}/repositorio/${id}`, { headers });
                const meta = resMeta.data;
                setMaterial(meta);

                // Asignar datos de calificación
                setPromedio(meta.promedioCalificacion || 0);
                setTotalVotos(meta.totalVotos || 0);
                setMiPuntuacion(meta.miCalificacion || 0);

                const tipoDetectado = tipoDeArchivo(meta.ubicacion);
                setTipo(tipoDetectado);

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

    // Descarga forzada con feedback animado de spinner
    async function handleDescargar() {
        if (descargando) return;
        setDescargando(true);
        try {
            const token = obtenerToken();
            const headers = { Authorization: `Bearer ${token}` };

            try {
                await axios.post(`${API_BASE}/repositorio/${id}/descargas`, {}, { headers });
                setMaterial(prev => prev ? { ...prev, descargas: (prev.descargas ?? 0) + 1 } : null);
            } catch (err) {
                console.error("Error al registrar descarga:", err);
            }

            const res = await axios.get(`${API_BASE}/repositorio/${id}/descargar`, {
                headers,
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
        } finally {
            setDescargando(false);
        }
    }

    if (cargando) {
        return <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse text-center text-sm text-zinc-500">Cargando apunte...</div>;
    }

    if (error) {
        return <div className="max-w-4xl mx-auto px-4 py-8 text-red-500 text-sm">{error}</div>;
    }

    const etiquetas = Array.isArray(material?.etiquetas) ? material.etiquetas : [];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-6 transition cursor-pointer">
                <FiArrowLeft /> volver al repositorio
            </button>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                
                {/* Header con metadata, descargas y sección de calificaciones */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 truncate">
                            {material?.titulo}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeClase(tipo)}`}>
                                {tipo.toUpperCase()}
                            </span>
                            {etiquetas.map((tag) => (
                                <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                    #{tag}
                                </span>
                            ))}
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                <FiDownload className="w-3.5 h-3.5" />
                                {material?.descargas ?? 0} descargas
                            </span>
                        </div>

                        {/* ── SECCIÓN INTERACTIVA DE CALIFICACIÓN CON ESTRELLAS ── */}
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                Califica este apunte:
                            </span>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((estrella) => (
                                    <button
                                        key={estrella}
                                        disabled={enviandoCalificacion}
                                        onClick={() => handleCalificar(estrella)}
                                        onMouseEnter={() => setHoverEstrella(estrella)}
                                        onMouseLeave={() => setHoverEstrella(0)}
                                        className="p-1 text-lg transition-transform active:scale-125 disabled:opacity-50 cursor-pointer bg-transparent border-none"
                                        title={`Calificar con ${estrella} estrella${estrella > 1 ? 's' : ''}`}
                                    >
                                        <FiStar
                                            className={`w-5 h-5 transition-colors ${
                                                estrella <= (hoverEstrella || miPuntuacion)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-zinc-300 dark:text-zinc-600 hover:text-amber-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 ml-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                    {parseFloat(promedio).toFixed(1)} ★
                                </span>{" "}
                                <span className="text-zinc-400">({totalVotos} {totalVotos === 1 ? "voto" : "votos"})</span>
                            </div>
                        </div>
                    </div>

                    {/* Botón Descargar con Spinner */}
                    <button
                        onClick={handleDescargar}
                        disabled={descargando}
                        className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-indigo-600 hover:bg-indigo-700 text-white transition shrink-0 cursor-pointer disabled:opacity-60 shadow-sm"
                    >
                        {descargando ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
                        <span>{descargando ? "Descargando..." : "Descargar archivo"}</span>
                    </button>
                </div>

                {/* Zona del visor */}
                <div className="bg-zinc-50 dark:bg-zinc-950 min-h-[500px] flex items-center justify-center">
                    {tipo === "pdf" && blobUrl && (
                        <iframe src={blobUrl} title={material?.titulo} className="w-full h-[600px] border-none" />
                    )}
                    {tipo === "imagen" && blobUrl && (
                        <img src={blobUrl} alt={material?.titulo} className="max-w-full max-h-[600px] object-contain p-6" />
                    )}
                    {tipo === "otro" && (
                        <div className="text-center py-16 px-8">
                            <FiFile className="w-14 h-14 mx-auto text-zinc-300 mb-4" />
                            <p className="text-sm text-zinc-500 mb-5">Este archivo no tiene previsualización disponible.</p>
                            <button onClick={handleDescargar} disabled={descargando} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition cursor-pointer">
                                {descargando ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
                                <span>{descargando ? "Descargando..." : "Descargar archivo"}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MuroMaterialEstudio;