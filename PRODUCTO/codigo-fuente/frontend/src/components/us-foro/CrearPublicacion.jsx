import React, { useState, useEffect } from 'react';

const CrearPublicacion = ({ idMateriaActual, nombreMateriaActual, onPublicacionCreada, onCancelar }) => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [categoria, setCategoria] = useState('Duda'); // 'General', 'Duda', 'Opinión', 'Recurso'
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
    const [error, setError] = useState('');

    // Estado para etiquetas
    const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
    const [etiquetasLista, setEtiquetasLista] = useState([]);
    const [popularesCargadas, setPopularesCargadas] = useState([]);

    // 👇 SECTOR 1: Leemos dinámicamente el usuario logueado desde el localStorage del navegador
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario")) || {};
    const nombreUsuarioLogueado = usuarioGuardado.nombre || "Tu Perfil";
    const apellidoUsuarioLogueado = usuarioGuardado.apellido || "(Vista Previa)";
    
    // Generamos las iniciales dinámicas para el Avatar circular
    const inicialesAvatar = usuarioGuardado.nombre && usuarioGuardado.apellido
        ? `${usuarioGuardado.nombre[0]}${usuarioGuardado.apellido[0]}`.toUpperCase()
        : "US";

    // Cargar las 5 etiquetas aleatorias de las 15 más usadas
    useEffect(() => {
        const fetchPopulares = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
                const response = await fetch(`${apiUrl}/publicaciones/etiquetas/populares`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setPopularesCargadas(data);
                }
            } catch (err) {
                console.error("Error al obtener etiquetas populares:", err);
            }
        };
        fetchPopulares();
    }, []);

    const agregarEtiqueta = () => {
        let tag = nuevaEtiqueta.trim();
        if (!tag) return;

        // Aseguramos que empiece con #
        if (!tag.startsWith('#')) {
            tag = `#${tag}`;
        }

        if (!etiquetasLista.includes(tag)) {
            setEtiquetasLista([...etiquetasLista, tag]);
        }
        setNuevaEtiqueta('');
    };

    const agregarEtiquetaDirecta = (tag) => {
        if (!etiquetasLista.includes(tag)) {
            setEtiquetasLista([...etiquetasLista, tag]);
        }
    };

    const handleKeyDownEtiqueta = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarEtiqueta();
        }
    };

    const eliminarEtiqueta = (tagEliminar) => {
        setEtiquetasLista(etiquetasLista.filter(tag => tag !== tagEliminar));
    };

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
                    categoria: categoria,
                    etiquetas: etiquetasLista
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
            setEtiquetasLista([]);

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

                    {/* SECCIÓN DE ETIQUETAS */}
                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                        <label className="text-[11px] text-gray-500 font-bold uppercase block">Etiquetas</label>
                        
                        <div className="flex gap-2 items-center">
                            <div className="relative flex items-center grow">
                                <span className="absolute left-3 text-gray-400 font-semibold text-xs select-none">#</span>
                                <input
                                    type="text"
                                    placeholder="Agregar etiqueta (ej: 3k1, resumen)..."
                                    value={nuevaEtiqueta}
                                    onChange={(e) => setNuevaEtiqueta(e.target.value.replace(/[^a-zA-Z0-9_#]/g, ''))}
                                    onKeyDown={handleKeyDownEtiqueta}
                                    className="w-full pl-6 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={agregarEtiqueta}
                                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl text-xs transition cursor-pointer"
                            >
                                Agregar
                            </button>
                        </div>

                        {/* Lista de etiquetas añadidas */}
                        {etiquetasLista.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {etiquetasLista.map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold select-none">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => eliminarEtiqueta(tag)}
                                            className="text-indigo-400 hover:text-indigo-700 font-bold ml-1 text-xs cursor-pointer focus:outline-none"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Ejemplos y sugerencias */}
                        <div className="mt-1 flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Ejemplos:</span>
                                {['3k1', '5k3', 'resumen', 'parcial'].map((sug) => {
                                    const tagSug = `#${sug}`;
                                    const yaAgregado = etiquetasLista.includes(tagSug);
                                    return (
                                        <button
                                            key={sug}
                                            type="button"
                                            disabled={yaAgregado}
                                            onClick={() => agregarEtiquetaDirecta(tagSug)}
                                            className={`px-2 py-1 rounded-lg border transition text-[10px] font-medium cursor-pointer ${
                                                yaAgregado 
                                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-gray-600'
                                            }`}
                                        >
                                            {tagSug}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Etiquetas más usadas */}
                            {popularesCargadas.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 items-center border-t border-gray-200/60 pt-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Etiquetas populares:</span>
                                    {popularesCargadas.map((pop) => {
                                        const yaAgregado = etiquetasLista.includes(pop);
                                        return (
                                            <button
                                                key={pop}
                                                type="button"
                                                disabled={yaAgregado}
                                                onClick={() => agregarEtiquetaDirecta(pop)}
                                                className={`px-2 py-1 rounded-lg border transition text-[10px] font-medium cursor-pointer ${
                                                    yaAgregado 
                                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white border-purple-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 text-gray-600'
                                                }`}
                                            >
                                                {pop}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
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
                            
                            <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-[9px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
                                    {nombreMateriaActual}
                                </span>
                                <span className="text-[9px] bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-full">
                                    {categoria}
                                </span>
                                {etiquetasLista.map((tag) => (
                                    <span key={tag} className="text-[9px] bg-zinc-200/70 text-zinc-700 font-medium px-2 py-0.5 rounded-full">
                                        {tag}
                                    </span>
                                ))}
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