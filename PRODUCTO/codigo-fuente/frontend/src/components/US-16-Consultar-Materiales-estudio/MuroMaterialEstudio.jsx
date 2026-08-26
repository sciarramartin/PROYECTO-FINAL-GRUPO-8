import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiDownload, FiFile, FiFileText, FiImage } from "react-icons/fi";

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

    useEffect(() => {
        let url = null;

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const token = obtenerToken();
                const headers = { Authorization: `Bearer ${token}` };

                // 1️⃣ Metadata — igual que antes
                const resMeta = await axios.get(`${API_BASE}/repositorio/${id}`, { headers });
                const meta = resMeta.data;
                setMaterial(meta);

                const tipoDetectado = tipoDeArchivo(meta.ubicacion);
                setTipo(tipoDetectado);

                // 2️⃣ Binario — con axios hay que pedir responseType: 'blob'
                //    La respuesta llega en res.data directamente, sin llamar a .blob()
                if (tipoDetectado === "pdf" || tipoDetectado === "imagen") {
                    const resBlob = await axios.get(`${API_BASE}/repositorio/${id}/descargar`, {
                        headers,
                        responseType: "blob"  // ← clave: sin esto axios devuelve texto
                    });
                    url = URL.createObjectURL(resBlob.data);  // ← resBlob.data ya es el Blob
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

    // Descarga forzada — mismo patrón: responseType blob, usar res.data
    async function handleDescargar() {
        try {
            const token = obtenerToken();
            const headers = { Authorization: `Bearer ${token}` };

            // Registrar descarga en el backend
            try {
                await axios.post(`${API_BASE}/repositorio/${id}/descargas`, {}, { headers });
                setMaterial(prev => prev ? { ...prev, descargas: (prev.descargas ?? 0) + 1 } : null);
            } catch (err) {
                console.error("Error al registrar la descarga en el servidor:", err);
            }

            const res = await axios.get(`${API_BASE}/repositorio/${id}/descargar`, {
                headers,
                responseType: "blob"  // ← ídem
            });
            const url = URL.createObjectURL(res.data);  // ← res.data, no res.blob()
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

    const etiquetas = material?.etiquetas;
    const fechaFormateada = material?.fecha_de_publicacion
        ? new Date(material.fecha_de_publicacion).toLocaleDateString("es-AR", {
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

                {/* Header con metadata */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4">
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

                            {/* Separador */}
                            <span className="text-zinc-300 dark:text-zinc-700 text-xs">•</span>

                            {/* Descargas */}
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                <FiDownload className="w-3.5 h-3.5 text-zinc-450 dark:text-zinc-450" />
                                {material?.descargas ?? 0} {material?.descargas === 1 ? "descarga" : "descargas"}
                            </span>
                        </div>
                    </div>

                    {/* Botón descargar */}
                    <button
                        onClick={handleDescargar}
                        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition shrink-0"
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
                                className="inline-flex items-center mt-2 gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
                            >
                                <FiDownload className="w-4 h-4" /> Descargar archivo
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default MuroMaterialEstudio;
