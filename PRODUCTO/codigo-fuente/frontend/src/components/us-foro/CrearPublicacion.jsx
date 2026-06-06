import React, { useState, useEffect } from 'react';

const CrearPublicacion = ({ idMateriaActual, nombreMateriaActual, onPublicacionCreada, onCancelar }) => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [categoria, setCategoria] = useState('Duda'); // 'General', 'Duda', 'Opinión', 'Recurso'
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
    const [error, setError] = useState('');

    // 👇 SECTOR 1: Leemos dinámicamente el usuario logueado desde el localStorage del navegador
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario")) || {};
    const nombreUsuarioLogueado = usuarioGuardado.nombre || "Tu Perfil";
    const apellidoUsuarioLogueado = usuarioGuardado.apellido || "(Vista Previa)";
    
    // Generamos las iniciales dinámicas para el Avatar circular
    const inicialesAvatar = usuarioGuardado.nombre && usuarioGuardado.apellido
        ? `${usuarioGuardado.nombre[0]}${usuarioGuardado.apellido[0]}`.toUpperCase()
        : "US";

    const handlePublicar = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeConfirmacion('');

        // ❌ Validaciones de Criterios de Aceptación (Falla si están vacíos)
        if (!titulo.trim()) {
            setError('El sistema requiere un título obligatorio para continuar.');
            return;
        }
        if (!contenido.trim()) {
            setError('El cuerpo del contenido no puede estar vacío.');
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
            
            // Le pegamos al endpoint exclusivo de tu nuevo módulo controlador
            const response = await fetch(`${apiUrl}/publicaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_materia: idMateriaActual, // Asociado automáticamente
                    titulo: titulo.trim(),
                    contenido: contenido.trim(),
                    categoria: categoria
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar la publicación');
            }

            // Mensaje de confirmación al publicar (Criterio de Aceptación)
            setMensajeConfirmacion('¡Publicación creada con éxito!');
            
            // Limpiamos el formulario
            setTitulo('');
            setContenido('');

            // Esperamos 2 segundos para que el usuario vea el cartel verde de éxito y volvemos al muro
            setTimeout(() => {
                if (typeof onPublicacionCreada === 'function') {
                    onPublicacionCreada(); 
                }
            }, 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4 font-sans">
            {/* Breadcrumb de navegación superior */}
            <div className="text-xs text-gray-400 flex gap-2">
                <span>Foros</span> &gt; <span className="text-indigo-600 font-medium">{nombreMateriaActual}</span> &gt; <span>Crear publicación</span>
            </div>

            <div className="flex flex-col gap-1 mb-2">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    💬 Crear publicación en foro
                </h2>
                <p className="text-xs text-gray-400">Comparte tus dudas, consultas, recursos u opiniones con otros miembros de la comunidad.</p>
            </div>

            {/* Alertas de Éxito / Error */}
            {error && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-semibold">⚠️ {error}</div>}
            {mensajeConfirmacion && <div className="p-3 bg-green-50 text-green-600 border border-green-100 rounded-xl text-xs font-semibold">✅ {mensajeConfirmacion}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* COLUMNA IZQUIERDA: Formulario de Carga */}
                <form onSubmit={handlePublicar} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div>
                        <label className="text-[11px] text-gray-500 font-bold uppercase block mb-1">Título *</label>
                        <input 
                            type="text" 
                            placeholder="Escribe un título claro y descriptivo..." 
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            maxLength={100}
                            className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all"
                        />
                        <span className="text-[10px] text-gray-400 float-right mt-1">{titulo.length}/100</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] text-gray-500 font-bold uppercase block mb-1">Materia (asociada automáticamente)</label>
                            <input 
                                type="text" 
                                value={nombreMateriaActual} 
                                disabled 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-medium cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-gray-500 font-bold uppercase block mb-1">Categoría / Tipo de post</label>
                            <select 
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl text-xs bg-white outline-none focus:border-indigo-500 text-gray-700"
                            >
                                <option value="Duda">❓ Duda o Consulta</option>
                                <option value="General">📚 General</option>
                                <option value="Opinión">💬 Opinión</option>
                                <option value="Recurso">🔗 Recurso</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] text-gray-500 font-bold uppercase block mb-1">Contenido *</label>
                        <div className="flex gap-2 p-2 border border-b-0 border-gray-200 bg-gray-50 rounded-t-xl text-xs text-gray-500 font-mono select-none">
                            <span className="font-bold px-1.5 cursor-pointer hover:text-black">B</span>
                            <span className="italic px-1.5 cursor-pointer hover:text-black">I</span>
                            <span className="underline px-1.5 cursor-pointer hover:text-black">U</span>
                            <span className="px-1.5 border-l border-gray-300">🔗</span>
                            <span className="px-1.5">🖼️</span>
                        </div>
                        <textarea 
                            rows="8" 
                            placeholder="Escribe aquí tu publicación..." 
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            maxLength={4000}
                            className="w-full p-3 border border-gray-200 rounded-b-xl text-xs outline-none focus:border-indigo-500 resize-none transition-all"
                        />
                        <span className="text-[10px] text-gray-400 float-right mt-1">{contenido.length}/4000</span>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            type="button" 
                            onClick={onCancelar}
                            className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                        >
                            🚀 Publicar publicación
                        </button>
                    </div>
                </form>

                {/* COLUMNA DERECHA: Vista previa dinámica */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vista previa</h4>
                        
                        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                {/* 👇 SECTOR 2: Avatar con iniciales dinámicas reales del estudiante */}
                                <div className="w-7 h-7 bg-indigo-500 text-white font-bold rounded-full text-[11px] flex items-center justify-center shrink-0 shadow-sm">
                                    {inicialesAvatar}
                                </div>
                                <div>
                                    {/* 👇 SECTOR 2: Nombre y Apellido dinámicos reales */}
                                    <p className="text-xs font-bold text-gray-800">
                                        {nombreUsuarioLogueado} {apellidoUsuarioLogueado}
                                    </p>
                                    <p className="text-[10px] text-gray-400">Estudiante</p>
                                </div>
                            </div>
                            
                            <h3 className="text-sm font-bold text-gray-800 mt-1">
                                {titulo || 'Título de la publicación'}
                            </h3>
                            
                            <div>
                                <span className="text-[9px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
                                    {nombreMateriaActual}
                                </span>
                                <span className="text-[9px] bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-full ml-1">
                                    {categoria}
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 whitespace-pre-wrap mt-1 min-h-[40px]">
                                {contenido || 'Este es un ejemplo de cómo se verá tu publicación en el foro una vez que sea publicada.'}
                            </p>
                            
                            <div className="text-[10px] text-gray-400 border-t border-gray-100 pt-2 mt-2 flex items-center gap-1">
                                📅 {new Date().toLocaleDateString()} • <span className="text-indigo-500 font-medium">Ahora</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CrearPublicacion;