import React, { useState } from 'react';
import { FiArrowUp, FiArrowDown, FiMessageSquare, FiFlag, FiTrash2 } from 'react-icons/fi';

const ComentarioNodo = ({ comentario, todasLasRespuestas, alResponder, idUsuarioActual, idPublicacionAutor, alVotar, alReportar, alEliminar }) => {
    const [mostrarFormularioRespuesta, setMostrarFormularioRespuesta] = useState(false);
    const [textoRespuesta, setTextoRespuesta] = useState("");
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

    // 🔍 Filtramos todas las respuestas cuyo padre sea ESTE comentario actual
    const misHijos = todasLasRespuestas.filter(r => r.id_comentario_padre === comentario.id);

    const esAutorComentario = comentario.id_usuario === idUsuarioActual || comentario.Autor?.id === idUsuarioActual;
    const esAutorPublicacion = idPublicacionAutor === idUsuarioActual;
    const puedeEliminar = esAutorComentario || esAutorPublicacion;

    // Formatear fecha linda (Ej: 13/6/2026 16:30)
    const fechaFormateada = new Date(comentario.createdAt).toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const manejarEnvioRespuesta = (e) => {
        e.preventDefault();
        if (!textoRespuesta.trim()) return;
        
        // Disparamos la acción hacia el componente padre
        alResponder(textoRespuesta, comentario.id);
        setTextoRespuesta("");
        setMostrarFormularioRespuesta(false);
    };

    return (
        <div className="flex flex-col mt-4">
            {/* Contenedor principal del comentario */}
            <div className="flex gap-3">
                {/* Avatar del Autor */}
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {comentario.Autor?.nombre?.[0] || "U"}
                </div>

                {/* Cuerpo del Mensaje */}
                <div className="flex-1 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 dark:text-zinc-200 text-sm">
                            {comentario.Autor?.nombre} {comentario.Autor?.apellido || "(Estudiante)"}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-zinc-500">{fechaFormateada}</span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">{comentario.contenido}</p>

                    {/* Botonera de acciones (con valoración e íconos premium) */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200/70 dark:hover:bg-zinc-700/70 transition px-2 py-0.5 rounded-full font-bold">
                            <button
                                type="button"
                                onClick={() => alVotar && alVotar(comentario.id, 'positivo')}
                                className="hover:text-amber-500 transition border-none bg-transparent cursor-pointer p-0.5 flex items-center"
                            >
                                <FiArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-gray-700 dark:text-zinc-300 min-w-[8px] text-center">{comentario.votos || 0}</span>
                            <button
                                type="button"
                                onClick={() => alVotar && alVotar(comentario.id, 'negativo')}
                                className="hover:text-indigo-500 transition border-none bg-transparent cursor-pointer p-0.5 flex items-center"
                            >
                                <FiArrowDown className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <button 
                            type="button"
                            onClick={() => setMostrarFormularioRespuesta(!mostrarFormularioRespuesta)}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors border-none bg-transparent cursor-pointer flex items-center gap-1.5"
                        >
                            <FiMessageSquare className="w-3.5 h-3.5" />
                            Responder
                        </button>

                        <button
                            type="button"
                            className="hover:text-red-600 dark:hover:text-red-400 transition border-none bg-transparent cursor-pointer flex items-center gap-1.5"
                            onClick={() => alReportar && alReportar(comentario.id)}
                        >
                            <FiFlag className="w-3.5 h-3.5" />
                            Reportar
                        </button>

                        {puedeEliminar && (
                            <button
                                type="button"
                                className="hover:text-red-600 dark:hover:text-red-400 hover:font-bold transition border-none bg-transparent cursor-pointer flex items-center gap-1.5"
                                onClick={() => setConfirmandoEliminar(true)}
                            >
                                <FiTrash2 className="w-3.5 h-3.5" />
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Formulario desplegable para escribir la respuesta */}
            {mostrarFormularioRespuesta && (
                <form onSubmit={manejarEnvioRespuesta} className="ml-6 sm:ml-11 mt-2 flex gap-2">
                    <input
                        type="text"
                        placeholder="Escribe una respuesta..."
                        value={textoRespuesta}
                        onChange={(e) => setTextoRespuesta(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700">
                        Responder
                    </button>
                </form>
            )}

            {/* 🔗 SECCIÓN RECURSIVA: Las respuestas anidadas con la línea vertical estilo Reddit */}
            {misHijos.length > 0 && (
                <div className="flex ml-2 sm:ml-4 mt-2">
                    {/* 🛠️ LA LÍNEA VERTICAL DEL HILO */}
                    <div className="w-0.5 bg-gray-300 dark:bg-zinc-700 hover:bg-indigo-400 dark:hover:bg-indigo-500 transition-colors cursor-pointer mr-2 ml-1 sm:mr-4 sm:ml-3 rounded" />
                    
                    {/* Renderizamos recursivamente los hijos adentro de este mismo bloque */}
                    <div className="flex-1">
                        {misHijos.map(hijo => (
                            <ComentarioNodo
                                key={hijo.id}
                                comentario={hijo}
                                todasLasRespuestas={todasLasRespuestas}
                                alResponder={alResponder}
                                idUsuarioActual={idUsuarioActual}
                                idPublicacionAutor={idPublicacionAutor}
                                alVotar={alVotar}
                                alReportar={alReportar}
                                alEliminar={alEliminar}
                            />
                        ))}
                    </div>
                </div>
            )}
            {/* Modal de Confirmación de Eliminación de Comentario (Estilo Premium igual al de Publicación) */}
            {confirmandoEliminar && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">¿Eliminar comentario?</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Esta acción es irreversible y eliminará el comentario y todas sus respuestas asociadas.</p>
                        <div className="flex items-center justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setConfirmandoEliminar(false)}
                                className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition border-none bg-transparent cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button"
                                onClick={() => { alEliminar && alEliminar(comentario.id); setConfirmandoEliminar(false); }}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-sm shadow-red-500/20 border-none cursor-pointer"
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComentarioNodo;