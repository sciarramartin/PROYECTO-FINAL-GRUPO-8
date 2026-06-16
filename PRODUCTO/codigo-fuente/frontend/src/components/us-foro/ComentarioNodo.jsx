import React, { useState } from 'react';

const ComentarioNodo = ({ comentario, todasLasRespuestas, alResponder, idUsuarioActual }) => {
    const [mostrarFormularioRespuesta, setMostrarFormularioRespuesta] = useState(false);
    const [textoRespuesta, setTextoRespuesta] = useState("");

    // 🔍 Filtramos todas las respuestas cuyo padre sea ESTE comentario actual
    const misHijos = todasLasRespuestas.filter(r => r.id_comentario_padre === comentario.id);

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
                <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-sm">
                            {comentario.Autor?.nombre} {comentario.Autor?.apellido || "(Estudiante)"}
                        </span>
                        <span className="text-xs text-gray-400">{fechaFormateada}</span>
                    </div>
                    
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comentario.contenido}</p>

                    {/* Botonera de acciones */}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <button
                            type="button"
                            className="hover:text-green-600 transition"
                            onClick={() => alert("Funcionalidad en desarrollo")}
                        >
                            👍 Me gusta
                        </button>
                        <button 
                            onClick={() => setMostrarFormularioRespuesta(!mostrarFormularioRespuesta)}
                            className="hover:text-indigo-600 font-medium transition-colors"
                        >
                            ↩ Responder
                        </button>
                        <button
                            type="button"
                            className="hover:text-orange-600 transition"
                            onClick={() => alert("Funcionalidad en desarrollo")}
                        >
                            🚩 Reportar
                        </button>
                    </div>
                </div>
            </div>

            {/* Formulario desplegable para escribir la respuesta */}
            {mostrarFormularioRespuesta && (
                <form onSubmit={manejarEnvioRespuesta} className="ml-11 mt-2 flex gap-2">
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
                <div className="flex ml-4 mt-2">
                    {/* 🛠️ LA LÍNEA VERTICAL DEL HILO */}
                    <div className="w-0.5 bg-gray-300 hover:bg-indigo-400 transition-colors cursor-pointer mr-4 ml-3 rounded" />
                    
                    {/* Renderizamos recursivamente los hijos adentro de este mismo bloque */}
                    <div className="flex-1">
                        {misHijos.map(hijo => (
                            <ComentarioNodo
                                key={hijo.id}
                                comentario={hijo}
                                todasLasRespuestas={todasLasRespuestas}
                                alResponder={alResponder}
                                idUsuarioActual={idUsuarioActual}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComentarioNodo;