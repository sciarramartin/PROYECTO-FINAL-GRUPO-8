import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMessageSquare } from 'react-icons/fi';
import ComentarioNodo from './ComentarioNodo';
import EmptyState from '../common/EmptyState';

const SeccionComentarios = ({ idPublicacion, idUsuarioActual, idPublicacionAutor, alReportar }) => {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentarioRaiz, setNuevoComentarioRaiz] = useState("");
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    // 1. Cargar comentarios de la publicación desde el backend (simulado o real)
    useEffect(() => {
        const cargarComentarios = async () => {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

                const response = await axios.get(
                    `${apiUrl}/publicaciones/${idPublicacion}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setComentarios(response.data.comentarios);

            } catch (err) {
                console.error("Error cargando comentarios:", err);
            }
        };

        if (idPublicacion) {
            cargarComentarios();
        }
    }, [idPublicacion]);

    // 2. Función común para enviar comentarios (sirve para raíz y para respuestas)
    const manejarEnviarComentario = async (texto, idPadre = null) => {
        setError("");
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            console.log("TOKEN ENVIADO:", token);
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/foro/comentarios`, { // 🎯 Tu ruta /foro/comentarios
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    contenido: texto,
                    id_publicacion: Number(idPublicacion),
                    id_comentario_padre: Number(idPadre)
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Error al publicar comentario");
            }

            const data = await res.json();
            console.log("Comentario creado:", data);

            setComentarios((prev) => [
                ...prev,
                data.comentario
            ]);

            setNuevoComentarioRaiz("");
            setMensajeExito("¡Comentario publicado con éxito!");
            setTimeout(() => {
                setMensajeExito("");
            }, 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const manejarVotoComentario = async (comId, tipo) => {
        // Encontrar el comentario actual para calcular la actualización optimista
        const comActual = comentarios.find(c => c.id === comId);
        const votosPrevios = comActual ? (comActual.votos || 0) : 0;
        const miReaccionPrevia = comActual?.miReaccion || null;

        // Calcular ajuste optimista según la reacción actual
        let deltaVotos = 0;
        let nuevaReaccion = null;

        if (miReaccionPrevia === tipo) {
            // Quitar el voto si presiona el mismo
            deltaVotos = tipo === 'positivo' ? -1 : 1;
            nuevaReaccion = null;
        } else if (miReaccionPrevia) {
            // Cambiar de positivo a negativo o viceversa
            deltaVotos = tipo === 'positivo' ? 2 : -2;
            nuevaReaccion = tipo;
        } else {
            // Voto nuevo
            deltaVotos = tipo === 'positivo' ? 1 : -1;
            nuevaReaccion = tipo;
        }

        const votosOptimistas = votosPrevios + deltaVotos;

        // 🚀 1. Actualización optimista INMEDIATA (0ms de retraso, feedback reactivo)
        setComentarios(prev => prev.map(c => 
            c.id === comId ? { ...c, votos: votosOptimistas, miReaccion: nuevaReaccion } : c
        ));

        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
            
            const res = await axios.post(
                `${apiUrl}/publicaciones/comentarios/${comId}/reaccionar`,
                { tipo },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // 🎯 2. Sincronizar con el valor consolidado del backend
            setComentarios(prev => prev.map(c => 
                c.id === comId ? { ...c, votos: res.data.votos, miReaccion: res.data.reaccion?.tipo || null } : c
            ));

        } catch (err) {
            console.error("Error al votar comentario:", err);
            // ↩️ Rollback en caso de falla de red
            setComentarios(prev => prev.map(c => 
                c.id === comId ? { ...c, votos: votosPrevios, miReaccion: miReaccionPrevia } : c
            ));
            setError(err.response?.data?.error || "Error al registrar voto en comentario.");
        }
    };

    const manejarEliminarComentario = async (comId) => {
        setError("");
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
            
            await axios.delete(
                `${apiUrl}/foro/comentarios/${comId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setComentarios((prev) => {
                const idsAEliminar = new Set([comId]);
                let prevSize = 0;
                while (idsAEliminar.size !== prevSize) {
                    prevSize = idsAEliminar.size;
                    prev.forEach(c => {
                        if (c.id_comentario_padre && idsAEliminar.has(c.id_comentario_padre)) {
                            idsAEliminar.add(c.id);
                        }
                    });
                }
                return prev.filter(c => !idsAEliminar.has(c.id));
            });

            setMensajeExito("¡Comentario eliminado con éxito!");
            setTimeout(() => {
                setMensajeExito("");
            }, 3000);
        } catch (err) {
            console.error("Error al eliminar comentario:", err);
            setError(err.response?.data?.error || err.message || "Error al eliminar comentario.");
        }
    };

    // Filtramos los comentarios principales (los que no responden a nadie)
    const comentariosRaiz = comentarios.filter(c => c.id_comentario_padre === null);

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm mt-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100 mb-4">
                Comentarios ({comentarios.length})
            </h3>

            {error && <p className="text-red-500 text-sm mb-3">⚠️ {error}</p>}
            {mensajeExito && (
                <p className="text-green-600 text-sm mb-3">
                    ✅ {mensajeExito}
                </p>
            )}

            {/* Formulario Principal (Para comentar el Post original) */}
            <form 
                onSubmit={(e) => { e.preventDefault(); manejarEnviarComentario(nuevoComentarioRaiz); }}
                className="mb-6 flex gap-2"
            >
                <input
                    id="input-nuevo-comentario"
                    type="text"
                    placeholder="Escribe un comentario académico o duda..."
                    value={nuevoComentarioRaiz}
                    onChange={(e) => setNuevoComentarioRaiz(e.target.value)}
                    className="flex-1 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"
                />
                <button 
                    type="submit" 
                    disabled={!nuevoComentarioRaiz.trim()}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-opacity cursor-pointer border-none"
                >
                    Comentar
                </button>
            </form>

            {/* Listado de hilos */}
            <div className="space-y-2">
                {comentariosRaiz.length === 0 ? (
                    <EmptyState
                        variant="comentarios"
                        titulo="Aún no hay respuestas en este debate"
                        mensaje="Sé el primero en responder la consulta o compartir tu perspectiva con la comunidad."
                        accionTexto="Sé el primero en comentar"
                        iconoAccion={<FiMessageSquare className="w-4 h-4" />}
                        alHacerClic={() => {
                            const input = document.getElementById("input-nuevo-comentario");
                            if (input) {
                                input.focus();
                                input.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                        }}
                        className="my-3 py-8"
                    />
                ) : (
                    comentariosRaiz.map(comentario => (
                        <ComentarioNodo
                            key={comentario.id}
                            comentario={comentario}
                            todasLasRespuestas={comentarios} // Pasamos la bolsa completa para que los nodos busquen sus hijos
                            alResponder={manejarEnviarComentario}
                            idUsuarioActual={idUsuarioActual}
                            idPublicacionAutor={idPublicacionAutor}
                            alVotar={manejarVotoComentario}
                            alReportar={alReportar}
                            alEliminar={manejarEliminarComentario}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SeccionComentarios;