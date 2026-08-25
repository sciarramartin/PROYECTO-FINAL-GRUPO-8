import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiUsers, FiUser, FiCheck, FiSend, FiLoader, FiCopy } from 'react-icons/fi';

const CompartirPublicacion = ({ isOpen, onClose, publicacion, nombreMateriaForo }) => {
    const [pestañaActiva, setPestañaActiva] = useState('grupos'); // 'grupos' o 'amigos'
    
    // Estados para la data del backend
    const [grupos, setGrupos] = useState([]);
    const [amigos, setAmigos] = useState([]);
    const [cargando, setCargando] = useState(false);
    
    // Feedback de envío/copiado
    const [compartidoId, setCompartidoId] = useState(null); 
    const [copiado, setCopiado] = useState(false);

    // URL base del backend
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    // Cargar Grupos y Amigos Reales cuando se abre el modal
    useEffect(() => {
        if (!isOpen) return;

        const cargarDatosCompartir = async () => {
            setCargando(true);
            try {
                // Hacemos las llamadas en paralelo a los endpoints correspondientes
                const [resGrupos, resAmigos] = await Promise.all([
                    axios.get(`${apiUrl}/grupos`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${apiUrl}/amistades/lista`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                setGrupos(resGrupos.data || []);
                setAmigos(resAmigos.data || []);
            } catch (error) {
                console.error("Error al cargar amigos o grupos para compartir:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarDatosCompartir();
    }, [isOpen]);

    if (!isOpen) return null;

    // Obtener la URL de la publicación
    const obtenerUrlPublicacion = () => {
        if (!publicacion) return '';
        const { id: publicacionId, materiaId, id_materia } = publicacion;
        const segsUrl = window.location.pathname.split('/');
        const codigoMateriaUrl = materiaId || id_materia || (segsUrl[2] !== 'general' ? segsUrl[2] : 'general');
        return `${window.location.origin}/foros/${codigoMateriaUrl}/publicacion/${publicacionId}`;
    };

    // Copiar enlace directo al portapapeles
    const manejarCopiarEnlace = () => {
        const urlPublicacion = obtenerUrlPublicacion();
        if (!urlPublicacion) return;

        navigator.clipboard.writeText(urlPublicacion)
            .then(() => {
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
            })
            .catch((err) => {
                console.error("Error al copiar enlace:", err);
            });
    };

    // Acción al hacer clic en enviar
    const manejarCompartir = async (id, tipo) => {
        if (!publicacion) return;
        setCompartidoId(id);
        
        try {
            const { titulo, materiaId, id_materia, Materia } = publicacion;

            let nombreMostrado = "General";
            if (nombreMateriaForo) {
                nombreMostrado = nombreMateriaForo;
            } else if (Materia?.nombre) {
                nombreMostrado = Materia.nombre;
            } else if (publicacion.nombre_materia) {
                nombreMostrado = publicacion.nombre_materia;
            }

            const urlPublicacion = obtenerUrlPublicacion();
            const mensajeTexto = 
`📥 POST COMPARTIDO
───────────────────
📌 Materia: ${nombreMostrado.toUpperCase()}
💬 Hilo: "${titulo}"

⤵️ Hacé clic acá para ver la publicación completa y los comentarios:
🔗 ${urlPublicacion}
───────────────────`;

            if (tipo === 'grupo') {
                // Petición real al backend
                await axios.post(
                    `${apiUrl}/grupos/${id}/mensajes`, 
                    { contenido: mensajeTexto }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log(`[OK] Publicación compartida con éxito en el grupo ID: ${id}`);
            } else if (tipo === 'amigo') {
                // Petición real al backend
                await axios.post(
                    `${apiUrl}/chat-privado/${id}`, 
                    { contenido: mensajeTexto }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log(`[OK] Publicación compartida con éxito con el amigo ID: ${id}`);
            }
        } catch (err) {
            console.error("Error al registrar el compartido en la base de datos:", err);
        }

        // Dejamos el feedback de "Enviado" por 2 segundos
        setTimeout(() => {
            setCompartidoId(null);
        }, 2000);
    };

    // Helper para armar las iniciales del avatar
    const obtenerIniciales = (nombre = '', apellido = '') => {
        return `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase() || 'US';
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-150 animate-duration-150">
                
                {/* Cabecera del Modal */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        🔗 Compartir publicación
                    </h3>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition p-1 bg-transparent border-none cursor-pointer"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Copiar enlace directo (Escenario 1) */}
                <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-150 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Enlace directo</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                            {obtenerUrlPublicacion()}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={manejarCopiarEnlace}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border-none shrink-0 ${
                            copiado
                                ? 'bg-green-600 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        }`}
                    >
                        {copiado ? <FiCheck /> : <FiCopy />}
                        {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                </div>

                {/* Selector de Pestañas (Grupos vs Amigos) */}
                <div className="flex border-b border-zinc-100 dark:border-zinc-800 mb-4">
                    <button
                        type="button"
                        onClick={() => setPestañaActiva('grupos')}
                        className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 border-b-2 bg-transparent cursor-pointer transition-colors ${
                            pestañaActiva === 'grupos'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                        }`}
                    >
                        <FiUsers className="w-4 h-4" />
                        Mis Grupos ({grupos.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setPestañaActiva('amigos')}
                        className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 border-b-2 bg-transparent cursor-pointer transition-colors ${
                            pestañaActiva === 'amigos'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                        }`}
                    >
                        <FiUser className="w-4 h-4" />
                        Amigos ({amigos.length})
                    </button>
                </div>

                {/* Contenido / Listados */}
                {cargando ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
                        <FiLoader className="w-6 h-6 animate-spin text-indigo-600" />
                        <span className="text-xs">Buscando tus datos reales...</span>
                    </div>
                ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        
                        {/* Render de Pestaña Grupos */}
                        {pestañaActiva === 'grupos' && (
                            grupos.length === 0 ? (
                                <p className="text-center text-xs text-zinc-400 py-6">No perteneces a ningún grupo todavía.</p>
                            ) : (
                                grupos.map((g) => (
                                    <div key={g.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                                <FiUsers className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">{g.nombre}</p>
                                                <p className="text-[10px] text-zinc-400">Creador: {g.Creador?.nombre || 'Alguien'}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => manejarCompartir(g.id, 'grupo')}
                                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border-none shrink-0 ${
                                                compartidoId === g.id
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                            }`}
                                        >
                                            {compartidoId === g.id ? <FiCheck /> : <FiSend />}
                                            {compartidoId === g.id ? 'Enviado' : 'Compartir'}
                                        </button>
                                    </div>
                                ))
                            )
                        )}

                        {/* Render de Pestaña Amigos */}
                        {pestañaActiva === 'amigos' && (
                            amigos.length === 0 ? (
                                <p className="text-center text-xs text-zinc-400 py-6">Aún no tienes amigos agregados.</p>
                            ) : (
                                amigos.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                {obtenerIniciales(a.nombre, a.apellido)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">{a.nombre} {a.apellido}</p>
                                                <p className="text-[10px] text-zinc-400">@{a.nombre_usuario || 'usuario'}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => manejarCompartir(a.id, 'amigo')}
                                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border-none shrink-0 ${
                                                compartidoId === a.id
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                            }`}
                                        >
                                            {compartidoId === a.id ? <FiCheck /> : <FiSend />}
                                            {compartidoId === a.id ? 'Enviado' : 'Compartir'}
                                        </button>
                                    </div>
                                ))
                            )
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default CompartirPublicacion;