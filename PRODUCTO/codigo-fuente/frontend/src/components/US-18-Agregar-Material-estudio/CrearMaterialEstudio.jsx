import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUploadCloud, FiTag, FiX, FiArrowLeft, FiBook, FiFileText } from 'react-icons/fi';

const CrearMaterialEstudio = () => {
    const navigate = useNavigate();

    const [titulo, setTitulo] = useState('');
    const [idMateria, setIdMateria] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [arrastrando, setArrastrando] = useState(false);
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [materias, setMaterias] = useState([]);

    // ── Etiquetas ────────────────────────────────────────────────────────────
    const [etiquetaInput, setEtiquetaInput] = useState('');
    const [etiquetas, setEtiquetas] = useState([]);
    const [mostrarDesplegable, setMostrarDesplegable] = useState(false);
    const [sugerencias, setSugerencias] = useState({ porTexto: [], porRelacion: [] });
    const [todosLosTags, setTodosLosTags] = useState([]);
    const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
    const inputRef = useRef(null);

    // Datos del usuario logueado
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};
    const nombreUsuario = usuarioGuardado.nombre || 'Tu Perfil';
    const apellidoUsuario = usuarioGuardado.apellido || '(Vista Previa)';
    const inicialesAvatar =
        usuarioGuardado.nombre && usuarioGuardado.apellido
            ? `${usuarioGuardado.nombre[0]}${usuarioGuardado.apellido[0]}`.toUpperCase()
            : 'US';

    // ── Cargar materias ───────────────────────────────────────────────────────
    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const response = await fetch(`${apiUrl}/materias`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMaterias(data);
                }
            } catch (err) {
                console.error('Error al cargar materias:', err);
            }
        };
        fetchMaterias();
    }, []);

    // ── Cargar todos los tags una sola vez al montar ──────────────────────────
    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const res = await axios.get(`${apiUrl}/repositorio/tags/todos`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const ranking = res.data?.ranking;
                setTodosLosTags(Array.isArray(ranking) ? ranking : []);
            } catch (e) {
                console.error('Error cargando tags:', e);
                setTodosLosTags([]);
            }
        };
        fetchTodos();
    }, []);

    // ── Sugerencias: texto escrito + relacionados a los seleccionados ─────────
    useEffect(() => {
        const texto = etiquetaInput.trim().toLowerCase();

        if (!texto) {
            setSugerencias({ porTexto: [], porRelacion: [] });
            return;
        }

        const fetchSugerencias = async () => {
            setCargandoSugerencias(true);
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

                // SECCIÓN 1: filtrado local por texto, ordenado por popularidad
                const listaSegura = Array.isArray(todosLosTags) ? todosLosTags : [];
                const coincidencias = listaSegura
                    .filter(({ tag }) =>
                        tag.toLowerCase().includes(texto) &&
                        !etiquetas.includes(tag)
                    )
                    .slice(0, 6)
                    .map(({ tag, count }) => ({ tag, count }));

                // SECCIÓN 2: relacionados a los ya seleccionados
                let relacionados = [];
                if (etiquetas.length > 0) {
                    const llamadas = etiquetas.map(tagSel =>
                        axios.get(`${apiUrl}/repositorio/tags/relacion`, {
                            params: { tag1: tagSel },
                            headers: { Authorization: `Bearer ${token}` }
                        }).then(r => r.data.ranking || []).catch(() => [])
                    );

                    const rankings = await Promise.all(llamadas);

                    // Fusionar: acumular count por tag en un Map
                    const acumulado = new Map();
                    rankings.forEach(ranking => {
                        ranking.forEach(({ tag, count }) => {
                            acumulado.set(tag, (acumulado.get(tag) || 0) + count);
                        });
                    });

                    const yaEnSeccion1 = new Set(coincidencias.map(c => c.tag));
                    relacionados = [...acumulado.entries()]
                        .filter(([tag]) =>
                            tag.toLowerCase().includes(texto) &&
                            !etiquetas.includes(tag) &&
                            !yaEnSeccion1.has(tag)
                        )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([tag, count]) => ({ tag, count }));
                }

                setSugerencias({ porTexto: coincidencias, porRelacion: relacionados });
            } catch (err) {
                console.error('Error al obtener sugerencias:', err);
            } finally {
                setCargandoSugerencias(false);
            }
        };

        const timer = setTimeout(fetchSugerencias, 300);
        return () => clearTimeout(timer);
    }, [etiquetaInput, etiquetas, todosLosTags]);

    // ── Agregar etiqueta ──────────────────────────────────────────────────────
    const agregarEtiqueta = (tag) => {
        const nueva = tag.trim().toLowerCase();
        if (nueva && !etiquetas.includes(nueva) && etiquetas.length < 10) {
            setEtiquetas(prev => [...prev, nueva]);
        }
        setEtiquetaInput('');
        setMostrarDesplegable(false);
        inputRef.current?.focus();
    };

    const eliminarEtiqueta = (tag) => {
        setEtiquetas(prev => prev.filter(t => t !== tag));
    };

    const handleEtiquetaKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && etiquetaInput.trim()) {
            e.preventDefault();
            agregarEtiqueta(etiquetaInput.replace(/,/g, ''));
        }
        // Borrar última etiqueta con Backspace si el input está vacío
        if (e.key === 'Backspace' && !etiquetaInput && etiquetas.length > 0) {
            eliminarEtiqueta(etiquetas[etiquetas.length - 1]);
        }
    };

    const hayResultados =
        sugerencias.porTexto.length > 0 || sugerencias.porRelacion.length > 0;

    // ── Drag & Drop ───────────────────────────────────────────────────────────
    const handleDragOver = (e) => { e.preventDefault(); setArrastrando(true); };
    const handleDragLeave = () => setArrastrando(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setArrastrando(false);
        const file = e.dataTransfer.files[0];
        if (file) setArchivo(file);
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setArchivo(file);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubir = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeConfirmacion('');

        if (!titulo.trim()) { setError('El título es obligatorio.'); return; }
        if (!idMateria) { setError('Debe seleccionar una materia.'); return; }
        if (!archivo) { setError('Debe adjuntar un archivo para subir el material.'); return; }

        setCargando(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

            const formData = new FormData();
            formData.append('titulo', titulo.trim());
            formData.append('id_materia', idMateria);
            formData.append('etiquetas', JSON.stringify(etiquetas));
            formData.append('archivo', archivo);

            const response = await fetch(`${apiUrl}/repositorio`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al subir el material');

            setMensajeConfirmacion('¡Material subido con éxito! Redirigiendo...');
            setTitulo(''); setIdMateria(''); setEtiquetas([]); setArchivo(null);
            setTimeout(() => navigate('/repositorio'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const nombreMateria = materias.find(m => String(m.id) === String(idMateria))?.nombre || '';

    return (
        <div className="p-6 bg-gray-50 dark:bg-zinc-950 min-h-screen flex flex-col gap-4 font-sans">
            {/* Breadcrumb */}
            <div className="text-xs text-gray-400 dark:text-zinc-500 flex gap-2 items-center">
                <button
                    onClick={() => navigate('/repositorio')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                >
                    <FiArrowLeft className="w-3.5 h-3.5" />
                    Repositorio
                </button>
                <span>&gt;</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">Agregar material</span>
            </div>

            {/* Encabezado */}
            <div className="flex flex-col gap-1 mb-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                    <FiUploadCloud className="w-5 h-5 text-indigo-500" />
                    Subir material de estudio
                </h2>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                    Comparte tus apuntes, resúmenes o recursos con otros estudiantes de la comunidad.
                </p>
            </div>

            {/* Alertas */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-semibold">
                    ⚠️ {error}
                </div>
            )}
            {mensajeConfirmacion && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-xl text-xs font-semibold">
                    ✅ {mensajeConfirmacion}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* COLUMNA IZQUIERDA: Formulario */}
                <form
                    onSubmit={handleSubir}
                    className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-5"
                >
                    {/* Título */}
                    <div>
                        <label className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold uppercase block mb-1">
                            Título *
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Resumen Unidad 3 - Álgebra Lineal"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            maxLength={120}
                            className="w-full p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all text-gray-800 dark:text-zinc-200"
                        />
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 float-right mt-1">
                            {titulo.length}/120
                        </span>
                    </div>

                    {/* Materia */}
                    <div>
                        <label className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold uppercase block mb-1">
                            Materia *
                        </label>
                        <div className="relative">
                            <FiBook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                            <select
                                value={idMateria}
                                onChange={(e) => setIdMateria(e.target.value)}
                                className="w-full pl-9 pr-4 p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs outline-none focus:border-indigo-500 text-gray-700 dark:text-zinc-300 cursor-pointer"
                            >
                                <option value="">Seleccionar materia...</option>
                                {materias.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Etiquetas con sugerencias ─────────────────────────────────── */}
                    <div>
                        <label className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold uppercase block mb-1">
                            Etiquetas{' '}
                            <span className="font-normal normal-case">
                                (Enter o coma para agregar · Backspace para borrar)
                            </span>
                        </label>

                        <div className="relative">
                            {/* Caja de chips + input */}
                            <div
                                onClick={() => inputRef.current?.focus()}
                                className="flex flex-wrap gap-1.5 p-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl min-h-[44px] items-center cursor-text"
                            >
                                {etiquetas.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-100/50 dark:border-indigo-900/30"
                                    >
                                        <FiTag className="w-2.5 h-2.5" />
                                        #{tag}
                                        <button
                                            type="button"
                                            onMouseDown={(e) => { e.preventDefault(); eliminarEtiqueta(tag); }}
                                            className="ml-0.5 text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer bg-transparent border-none p-0"
                                        >
                                            <FiX className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={etiquetaInput}
                                    onChange={(e) => {
                                        setEtiquetaInput(e.target.value);
                                        setMostrarDesplegable(true);
                                    }}
                                    onFocus={() => setMostrarDesplegable(true)}
                                    onBlur={() => setTimeout(() => setMostrarDesplegable(false), 150)}
                                    onKeyDown={handleEtiquetaKeyDown}
                                    placeholder={etiquetas.length === 0 ? 'algebra, resumen, unidad3...' : ''}
                                    className="flex-1 min-w-[120px] text-xs outline-none bg-transparent text-gray-700 dark:text-zinc-300 placeholder-gray-300 dark:placeholder-zinc-600 p-1"
                                />
                            </div>

                            {/* Dropdown de sugerencias */}
                            {mostrarDesplegable && etiquetaInput.trim() !== '' && (
                                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto">
                                    {cargandoSugerencias ? (
                                        <div className="p-3 text-xs text-zinc-400 dark:text-zinc-500 text-center flex items-center justify-center gap-1.5">
                                            <span className="animate-spin inline-block">⌛</span> Buscando...
                                        </div>
                                    ) : (
                                        <>
                                            {/* SECCIÓN 1: coincidencias por texto */}
                                            {sugerencias.porTexto.length > 0 && (
                                                <div className="py-1">
                                                    <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                                                        Similares a "{etiquetaInput}"
                                                    </div>
                                                    {sugerencias.porTexto.map((sug, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onMouseDown={() => agregarEtiqueta(sug.tag)}
                                                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs text-zinc-700 dark:text-zinc-300 font-medium flex items-center justify-between cursor-pointer transition border-none bg-transparent"
                                                        >
                                                            <span className="flex items-center gap-1.5">
                                                                <FiTag className="w-3 h-3 text-indigo-500" />
                                                                #{sug.tag}
                                                            </span>
                                                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-400 font-semibold">
                                                                {sug.count} {sug.count === 1 ? 'uso' : 'usos'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* SECCIÓN 2: relacionados a los ya seleccionados */}
                                            {sugerencias.porRelacion.length > 0 && (
                                                <div className={`py-1 ${sugerencias.porTexto.length > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}`}>
                                                    <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                                                        Relacionadas con tus etiquetas
                                                    </div>
                                                    {sugerencias.porRelacion.map((sug, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onMouseDown={() => agregarEtiqueta(sug.tag)}
                                                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs text-zinc-700 dark:text-zinc-300 font-medium flex items-center justify-between cursor-pointer transition border-none bg-transparent"
                                                        >
                                                            <span className="flex items-center gap-1.5">
                                                                <FiTag className="w-3 h-3 text-violet-500" />
                                                                #{sug.tag}
                                                            </span>
                                                            <span className="text-[10px] bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded-full text-violet-500 dark:text-violet-400 font-semibold">
                                                                {sug.count} {sug.count === 1 ? 'relación' : 'relaciones'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Sin resultados */}
                                            {!hayResultados && !cargandoSugerencias && (
                                                <div className="p-3 text-xs text-zinc-400 dark:text-zinc-500 text-center">
                                                    Sin sugerencias · Enter para agregar "{etiquetaInput}"
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 block">
                            {etiquetas.length}/10 etiquetas
                        </span>
                    </div>

                    {/* Zona de carga de archivo (drag & drop) */}
                    <div>
                        <label className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold uppercase block mb-1">
                            Archivo *
                        </label>
                        <label
                            htmlFor="archivo-input"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                                ${arrastrando
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                                    : archivo
                                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/10'
                                        : 'border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10'
                                }`}
                        >
                            <input
                                id="archivo-input"
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.zip"
                                className="hidden"
                            />
                            {archivo ? (
                                <>
                                    <FiFileText className="w-8 h-8 text-emerald-500" />
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{archivo.name}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                                            {(archivo.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-zinc-500">Clic para cambiar archivo</span>
                                </>
                            ) : (
                                <>
                                    <FiUploadCloud className={`w-8 h-8 ${arrastrando ? 'text-indigo-500' : 'text-gray-300 dark:text-zinc-600'}`} />
                                    <div className="text-center">
                                        <p className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                                            Arrastrá un archivo aquí o{' '}
                                            <span className="text-indigo-600 dark:text-indigo-400 underline">
                                                seleccioná desde tu dispositivo
                                            </span>
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                                            PDF, Word, PowerPoint, Excel, imágenes o ZIP
                                        </p>
                                    </div>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/repositorio')}
                            className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={cargando}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                            {cargando ? (
                                <><span className="animate-spin">⌛</span> Subiendo...</>
                            ) : (
                                <><FiUploadCloud className="w-3.5 h-3.5" /> Subir material</>
                            )}
                        </button>
                    </div>
                </form>

                {/* COLUMNA DERECHA: Vista previa dinámica */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                            Vista previa
                        </h4>
                        <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 bg-gray-50/50 dark:bg-zinc-800/30 flex flex-col gap-2">
                            {/* Avatar + autor */}
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-indigo-500 text-white font-bold rounded-full text-[11px] flex items-center justify-center shrink-0 shadow-sm">
                                    {inicialesAvatar}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                                        {nombreUsuario} {apellidoUsuario}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-zinc-500">Estudiante</p>
                                </div>
                            </div>

                            {/* Título */}
                            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-100 mt-1">
                                {titulo || 'Título del material'}
                            </h3>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1">
                                {nombreMateria && (
                                    <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full">
                                        {nombreMateria}
                                    </span>
                                )}
                                {etiquetas.slice(0, 4).map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="text-[9px] bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-semibold px-2 py-0.5 rounded-full"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {etiquetas.length > 4 && (
                                    <span className="text-[9px] bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 font-semibold px-2 py-0.5 rounded-full">
                                        +{etiquetas.length - 4}
                                    </span>
                                )}
                            </div>

                            {/* Archivo */}
                            {archivo && (
                                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 rounded-lg px-2.5 py-1.5 mt-1">
                                    <FiFileText className="w-3 h-3 text-emerald-500 shrink-0" />
                                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
                                        {archivo.name}
                                    </span>
                                </div>
                            )}

                            {/* Fecha */}
                            <div className="text-[10px] text-gray-400 dark:text-zinc-500 border-t border-gray-100 dark:border-zinc-700 pt-2 mt-1 flex items-center gap-1">
                                📅 {new Date().toLocaleDateString()} · <span className="text-indigo-500 font-medium">Ahora</span>
                            </div>
                        </div>
                    </div>

                    {/* Tip */}
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/25 rounded-2xl text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                        <p className="font-bold mb-1">💡 Consejos para un buen material</p>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-indigo-600/80 dark:text-indigo-400/80">
                            <li>Usá un título descriptivo y claro.</li>
                            <li>Agregá etiquetas para facilitar la búsqueda.</li>
                            <li>Asegurate de que el archivo esté completo antes de subir.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearMaterialEstudio;