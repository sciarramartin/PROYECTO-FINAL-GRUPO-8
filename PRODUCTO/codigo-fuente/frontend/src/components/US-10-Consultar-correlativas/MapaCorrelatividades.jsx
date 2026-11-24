import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import axios from 'axios';
import { obtenerTodas, obtenerProgreso, actualizarEstadoMateria } from './services';
import ModalSeleccionarComision from './ModalSeleccionarComision';
import EncuestaCatedraObligatoria from '../common/EncuestaCatedraObligatoria';
import { FiMaximize, FiMinimize, FiSearch, FiCompass, FiPlus, FiMinus, FiRotateCcw } from 'react-icons/fi';

// Componente vectorial del Hombre de Palo saltando (Stickman sin cara)
const StickmanSaltando = () => (
    <svg viewBox="0 0 100 120" className="w-10 h-10 animate-bounce shrink-0 overflow-visible">
        {/* Cabeza redonda simple */}
        <circle cx="50" cy="22" r="12" fill="none" stroke="#ffffff" strokeWidth="4" />

        {/* Cuerpo / Torso */}
        <line x1="50" y1="34" x2="50" y2="70" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

        {/* Brazo Izquierdo levantado festejando */}
        <line x1="50" y1="42" x2="22" y2="18" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

        {/* Brazo Derecho levantado festejando */}
        <line x1="50" y1="42" x2="78" y2="18" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

        {/* Pierna Izquierda doblada saltando */}
        <path d="M 50 70 L 32 88 L 22 106" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Pierna Derecha en ángulo de salto */}
        <path d="M 50 70 L 68 88 L 82 100" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Componente para la lluvia de confeti flotante
const ConfettiRain = () => {
    const confettiColors = ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
    const pieces = Array.from({ length: 24 });

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {pieces.map((_, i) => {
                const bg = confettiColors[i % confettiColors.length];
                const left = `${(i * 4.2) % 100}%`;
                const delay = `${(i * 0.12).toFixed(2)}s`;
                const duration = `${(1.8 + (i % 3) * 0.4).toFixed(2)}s`;

                return (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-xs animate-fall opacity-90"
                        style={{
                            backgroundColor: bg,
                            left,
                            top: '-10px',
                            animationDelay: delay,
                            animationDuration: duration,
                        }}
                    />
                );
            })}
        </div>
    );
};

const MapaCorrelatividades = () => {
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);
    const minimapCanvasRef = useRef(null);
    const networkRef = useRef(null);
    const nodesRef = useRef(null);
    const edgesRef = useRef(null);

    const [materias, setMaterias] = useState([]);
    const [progreso, setProgreso] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [nodoSeleccionado, setNodoSeleccionado] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [modalComisionAbierto, setModalComisionAbierto] = useState(false);
    const [modalEncuestaAbierto, setModalEncuestaAbierto] = useState(false);
    const [estadoPendiente, setEstadoPendiente] = useState(null);
    const [misEncuestas, setMisEncuestas] = useState([]);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [busquedaGrafo, setBusquedaGrafo] = useState('');

    const [zoomLevel, setZoomLevel] = useState(100);
    const initialScaleRef = useRef(1);

    // Estado para la notificación de logro
    const [notificacionLogro, setNotificacionLogro] = useState(null);

    const materiasRef = useRef([]);
    const progresoRef = useRef([]);
    materiasRef.current = materias;
    progresoRef.current = progreso;

    const [esOscuro, setEsOscuro] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setEsOscuro(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const colores = esOscuro ? {
        aprobada: { background: '#064e3b', border: '#10b981', font: '#ecfdf5' },
        regular: { background: '#78350f', border: '#f59e0b', font: '#fef3c7' },
        cursando: { background: '#581c87', border: '#a855f7', font: '#f3e8ff' },
        habilitada: { background: '#1e3a8a', border: '#3b82f6', font: '#dbeafe' },
        bloqueada: { background: '#1e293b', border: '#475569', font: '#94a3b8' },
    } : {
        aprobada: { background: '#d1fae5', border: '#10b981', font: '#064e3b' },
        regular: { background: '#fef3c7', border: '#f59e0b', font: '#78350f' },
        cursando: { background: '#f3e8ff', border: '#a855f7', font: '#581c87' },
        habilitada: { background: '#dbeafe', border: '#3b82f6', font: '#1e3a8a' },
        bloqueada: { background: '#ffffff', border: '#cbd5e1', font: '#1e293b' },
    };

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError(null);
            const usuarioInfo = sessionStorage.getItem('usuario') || localStorage.getItem('usuario');
            const usuarioObj = usuarioInfo ? JSON.parse(usuarioInfo) : null;
            const id_carrera = usuarioObj?.id_carrera || null;
            const userPlanId = usuarioObj?.id_plan_academico || null;
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const [resPlanes, progresoData, resEncuestas] = await Promise.all([
                axios.get(`${API_URL}/planes-academicos?id_carrera=${id_carrera}`),
                obtenerProgreso(),
                axios.get(`${API_URL}/encuestas-catedra/mis-encuestas`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: [] }))
            ]);

            setPlanes(resPlanes.data);
            setProgreso(progresoData);
            setMisEncuestas(resEncuestas.data || []);

            let activePlanId = userPlanId;
            if (!activePlanId && resPlanes.data.length > 0) {
                activePlanId = resPlanes.data[0].id;
            }
            setSelectedPlanId(activePlanId ? activePlanId.toString() : '');
        } catch (err) {
            console.error(err);
            setError('Error al cargar el mapa de correlatividades.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (!selectedPlanId) return;
        const cargarMateriasDelPlan = async () => {
            try {
                setCargando(true);
                const materiasData = await obtenerTodas(null, selectedPlanId);
                const materiasVisibles = materiasData.filter(m => m.visible_en_grafo !== false && m.visible_en_grafo !== 0);
                setMaterias(materiasVisibles);
            } catch (err) {
                console.error(err);
                setError('Error al cargar las materias del plan.');
            } finally {
                setCargando(false);
            }
        };
        cargarMateriasDelPlan();
    }, [selectedPlanId]);

    const getEstadoCalculado = (materiaId, estadoMateria, mapEstadosProgreso, materiasLista) => {
        if (estadoMateria === 'Aprobada' || estadoMateria === 'Regular' || estadoMateria === 'Cursando') {
            return estadoMateria.toLowerCase();
        }
        const materia = materiasLista.find(m => m.id === materiaId);
        if (!materia) return 'bloqueada';
        if (!materia.correlativas || materia.correlativas.length === 0) {
            return 'habilitada';
        }
        const cumpleRequisitos = materia.correlativas.every(req => {
            const estadoReq = mapEstadosProgreso[req.id];
            const tipo = req.correlativas_x_materia?.tipo_requisito || 'regular';
            if (tipo === 'aprobada') {
                return estadoReq === 'Aprobada';
            } else {
                return estadoReq === 'Aprobada' || estadoReq === 'Regular';
            }
        });
        return cumpleRequisitos ? 'habilitada' : 'bloqueada';
    };

    const actualizarNodosVisuales = useCallback(() => {
        if (!nodesRef.current || materiasRef.current.length === 0) return;

        const mapEstados = {};
        progresoRef.current.forEach(p => { mapEstados[p.id_materia] = p.estado; });

        const updates = [];
        nodesRef.current.forEach(node => {
            const estadoBase = mapEstados[node.id] || 'No Cursada';
            const estadoCalculado = getEstadoCalculado(node.id, estadoBase, mapEstados, materiasRef.current);
            const palette = colores[estadoCalculado] || colores.bloqueada;
            const m = materiasRef.current.find(mat => mat.id === node.id);
            if (!m) return;

            updates.push({
                id: node.id,
                label: `${m.nombre}\n${estadoBase}`,
                estadoCalculado,
                opacity: 1,
                borderWidth: 2,
                color: {
                    background: palette.background,
                    border: palette.border,
                    highlight: { background: palette.background, border: '#4f46e5' }
                },
                font: { face: 'Inter, sans-serif', size: 14, color: palette.font || (esOscuro ? '#f1f5f9' : '#1e293b') }
            });
        });

        if (updates.length > 0) {
            nodesRef.current.update(updates);
        }
    }, [colores, esOscuro]);

    const actualizarMinimapa = useCallback(() => {
        const minimapCanvas = minimapCanvasRef.current;
        if (!minimapCanvas || !networkRef.current) return;
        const ctx = minimapCanvas.getContext('2d');
        const width = minimapCanvas.width;
        const height = minimapCanvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = esOscuro ? '#090d16' : '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        const nodePositions = networkRef.current.getPositions();
        const nodeIds = Object.keys(nodePositions);
        if (nodeIds.length === 0) return;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodeIds.forEach(id => {
            const pos = nodePositions[id];
            if (pos.x < minX) minX = pos.x;
            if (pos.x > maxX) maxX = pos.x;
            if (pos.y < minY) minY = pos.y;
            if (pos.y > maxY) maxY = pos.y;
        });

        const padding = 200;
        minX -= padding; maxX += padding;
        minY -= padding; maxY += padding;

        const graphWidth = maxX - minX || 1;
        const graphHeight = maxY - minY || 1;

        const mapEstados = {};
        progresoRef.current.forEach(p => { mapEstados[p.id_materia] = p.estado; });

        nodeIds.forEach(id => {
            const pos = nodePositions[id];
            const nx = ((pos.x - minX) / graphWidth) * width;
            const ny = ((pos.y - minY) / graphHeight) * height;

            const estadoBase = mapEstados[id] || 'No Cursada';
            const estadoCalculado = getEstadoCalculado(Number(id), estadoBase, mapEstados, materiasRef.current);
            const palette = colores[estadoCalculado] || colores.bloqueada;

            ctx.fillStyle = palette.border;
            ctx.fillRect(nx - 2.5, ny - 2.5, 5, 5);
        });

        const viewPosition = networkRef.current.getViewPosition();
        const scale = networkRef.current.getScale();
        const containerW = containerRef.current ? containerRef.current.clientWidth : 800;
        const containerH = containerRef.current ? containerRef.current.clientHeight : 600;

        const vx = viewPosition.x - containerW / (2 * scale);
        const vy = viewPosition.y - containerH / (2 * scale);
        const vw = containerW / scale;
        const vh = containerH / scale;

        const mVx = ((vx - minX) / graphWidth) * width;
        const mVy = ((vy - minY) / graphHeight) * height;
        const mVw = (vw / graphWidth) * width;
        const mVh = (vh / graphHeight) * height;

        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(mVx, mVy, mVw, mVh);
        ctx.fillStyle = 'rgba(79, 70, 229, 0.08)';
        ctx.fillRect(mVx, mVy, mVw, mVh);
    }, []);

    useEffect(() => {
        if (cargando || error || !containerRef.current || materias.length === 0) return;

        if (networkRef.current) {
            networkRef.current.destroy();
            networkRef.current = null;
        }

        nodesRef.current = new DataSet();
        edgesRef.current = new DataSet();

        const mapEstados = {};
        progreso.forEach(p => { mapEstados[p.id_materia] = p.estado; });

        materias.forEach(materia => {
            const estadoBase = mapEstados[materia.id] || 'No Cursada';
            const estadoCalculado = getEstadoCalculado(materia.id, estadoBase, mapEstados, materias);
            const palette = colores[estadoCalculado] || colores.bloqueada;

            nodesRef.current.add({
                id: materia.id,
                label: `${materia.nombre}\n${estadoBase}`,
                level: parseInt(materia.nivel_anio) || 1,
                estadoCalculado,
                color: {
                    background: palette.background,
                    border: palette.border,
                    highlight: { background: palette.background, border: '#4f46e5' }
                },
                font: { face: 'Inter, sans-serif', size: 14, color: palette.font || (esOscuro ? '#f1f5f9' : '#1e293b') },
                shape: 'box',
                widthConstraint: { maximum: 200 },
                borderWidth: 2,
                borderRadius: 8,
                margin: 10,
                shadow: { enabled: true, color: 'rgba(0,0,0,0.05)', size: 5, x: 0, y: 4 }
            });

            if (materia.correlativas) {
                materia.correlativas.forEach(req => {
                    const tipo = req.correlativas_x_materia?.tipo_requisito || 'regular';
                    edgesRef.current.add({
                        id: `${req.id}-${materia.id}`,
                        from: req.id,
                        to: materia.id,
                        arrows: 'to',
                        color: { color: tipo === 'aprobada' ? (esOscuro ? 'rgba(129, 140, 248, 0.7)' : 'rgba(79, 70, 229, 0.4)') : (esOscuro ? 'rgba(100, 116, 139, 0.6)' : 'rgba(203, 213, 225, 0.8)') },
                        width: tipo === 'aprobada' ? 2 : 1.5,
                        dashes: tipo === 'regular' ? [5, 5] : false,
                        smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.6 }
                    });
                });
            }
        });

        const levelSeparation = 300;
        const data = { nodes: nodesRef.current, edges: edgesRef.current };
        const options = {
            layout: {
                hierarchical: {
                    direction: 'LR',
                    levelSeparation: levelSeparation,
                    nodeSpacing: 80,
                    treeSpacing: 150
                }
            },
            physics: false,
            interaction: {
                hover: true,
                selectConnectedEdges: true,
                zoomView: false,
                dragView: true,
            }
        };

        networkRef.current = new Network(containerRef.current, data, options);

        networkRef.current.once('stabilized', () => {
            const currentScale = networkRef.current.getScale();
            initialScaleRef.current = currentScale;
            setZoomLevel(100);
            actualizarNodosVisuales();
            actualizarMinimapa();
        });

        networkRef.current.on("beforeDrawing", function (ctx) {
            const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
            const colorsBg = isDark
                ? ['#090d16', '#0f172a', '#0b1120', '#090d16', '#0f172a']
                : ['#f0f9ff', '#faf5ff', '#f0fdf4', '#fff7ed', '#fdf2f8'];
            const yearNames = ['1° Año', '2° Año', '3° Año', '4° Año', '5° Año'];
            const positions = networkRef.current.getPositions();
            const levelX = {};

            materiasRef.current.forEach(m => {
                if (positions[m.id]) {
                    levelX[m.nivel_anio] = positions[m.id].x;
                }
            });

            [1, 2, 3, 4, 5].forEach(year => {
                if (levelX[year] !== undefined) {
                    const x = levelX[year];
                    const bandWidth = levelSeparation;

                    ctx.fillStyle = colorsBg[year - 1];
                    ctx.fillRect(x - bandWidth / 2, -10000, bandWidth, 20000);

                    const viewPos = networkRef.current.getViewPosition();
                    const scale = networkRef.current.getScale();
                    const textY = viewPos.y - (containerRef.current.clientHeight / 2) / scale + 40 / scale;

                    ctx.font = `bold ${Math.max(20, 20 / scale)}px Inter, sans-serif`;
                    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)";
                    ctx.textAlign = "center";
                    ctx.fillText(yearNames[year - 1], x, textY);
                }
            });
        });

        networkRef.current.on('dragEnd', actualizarMinimapa);
        networkRef.current.on('afterDrawing', actualizarMinimapa);

        networkRef.current.on('click', function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const materiaSelect = materiasRef.current.find(m => m.id === nodeId);

                const mapEst = {};
                progresoRef.current.forEach(p => { mapEst[p.id_materia] = p.estado; });
                const estadoActual = mapEst[nodeId] || 'No Cursada';
                setNodoSeleccionado({ ...materiaSelect, estadoActual });

                const ancestros = new Set();
                const ancestrosEdges = new Set();

                const encontrarAncestros = (id) => {
                    const incomingEdges = edgesRef.current.get().filter(e => e.to === id);
                    incomingEdges.forEach(e => {
                        ancestrosEdges.add(e.id);
                        if (!ancestros.has(e.from)) {
                            ancestros.add(e.from);
                            encontrarAncestros(e.from);
                        }
                    });
                };

                encontrarAncestros(nodeId);
                ancestros.add(nodeId);

                nodesRef.current.forEach(node => {
                    if (ancestros.has(node.id)) {
                        nodesRef.current.update({ id: node.id, opacity: 1, borderWidth: 3, color: { border: '#4f46e5' } });
                    } else {
                        nodesRef.current.update({ id: node.id, opacity: 0.2, borderWidth: 1, color: { border: '#cbd5e1' } });
                    }
                });

                edgesRef.current.forEach(edge => {
                    if (ancestrosEdges.has(edge.id)) {
                        edgesRef.current.update({ id: edge.id, color: { color: '#4f46e5' }, width: 3 });
                    } else {
                        edgesRef.current.update({ id: edge.id, color: { color: 'rgba(203, 213, 225, 0.2)' }, width: 1 });
                    }
                });

            } else {
                setNodoSeleccionado(null);
                actualizarNodosVisuales();
                edgesRef.current.forEach(edge => {
                    edgesRef.current.update({ id: edge.id, color: { color: 'rgba(203, 213, 225, 0.8)' } });
                });
            }
        });

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    }, [materias, cargando]);

    useEffect(() => {
        if (materias.length > 0) {
            actualizarNodosVisuales();
            actualizarMinimapa();
            if (networkRef.current) {
                networkRef.current.redraw();
            }
        }
    }, [progreso, materias, esOscuro, actualizarNodosVisuales, actualizarMinimapa]);

    const cambiarZoom = (porcentaje) => {
        if (!networkRef.current) return;
        const nuevoPorcentaje = Math.min(Math.max(porcentaje, 10), 200);
        setZoomLevel(nuevoPorcentaje);

        const targetScale = initialScaleRef.current * (nuevoPorcentaje / 100);
        networkRef.current.moveTo({
            scale: targetScale,
            animation: { duration: 150, easingFunction: 'easeInOutQuad' }
        });
        setTimeout(actualizarMinimapa, 160);
    };

    useEffect(() => {
        if (!networkRef.current || !nodesRef.current || !edgesRef.current) return;

        if (!busquedaGrafo.trim()) {
            actualizarNodosVisuales();
            edgesRef.current.forEach(edge => {
                edgesRef.current.update({ id: edge.id, color: { color: 'rgba(203, 213, 225, 0.8)' }, width: 1.5 });
            });
            return;
        }

        const query = busquedaGrafo.toLowerCase();
        const materiaEncontrada = materias.find(m => m.nombre.toLowerCase().includes(query) || (m.codigo && m.codigo.toLowerCase().includes(query)));

        if (!materiaEncontrada) return;

        networkRef.current.focus(materiaEncontrada.id, {
            scale: initialScaleRef.current * (zoomLevel / 100),
            animation: { duration: 800, easingFunction: 'easeInOutQuad' }
        });

        const vinculados = new Set([materiaEncontrada.id]);
        const edgesVinculados = new Set();

        const buscarConexiones = (id) => {
            const rels = edgesRef.current.get().filter(e => e.from === id || e.to === id);
            rels.forEach(e => {
                edgesVinculados.add(e.id);
                const vecino = e.from === id ? e.to : e.from;
                if (!vinculados.has(vecino)) {
                    vinculados.add(vecino);
                    buscarConexiones(vecino);
                }
            });
        };
        buscarConexiones(materiaEncontrada.id);

        nodesRef.current.forEach(node => {
            if (vinculados.has(node.id)) {
                nodesRef.current.update({ id: node.id, opacity: 1, borderWidth: node.id === materiaEncontrada.id ? 4 : 2.5, color: { border: '#4f46e5' } });
            } else {
                nodesRef.current.update({ id: node.id, opacity: 0.2, borderWidth: 1 });
            }
        });

        edgesRef.current.forEach(edge => {
            if (edgesVinculados.has(edge.id)) {
                edgesRef.current.update({ id: edge.id, color: { color: '#4f46e5' }, width: 2.5 });
            } else {
                edgesRef.current.update({ id: edge.id, color: { color: 'rgba(203, 213, 225, 0.1)' }, width: 1 });
            }
        });

    }, [busquedaGrafo]);

    const toggleFullscreen = () => {
        if (!wrapperRef.current) return;
        if (!document.fullscreenElement) {
            wrapperRef.current.requestFullscreen().catch(err => alert(`Error: ${err.message}`));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
        setTimeout(actualizarMinimapa, 200);
    };

    const handleCambiarEstado = (nuevoEstado) => {
        if (!nodoSeleccionado) return;
        if (nuevoEstado === 'Cursando') {
            setModalComisionAbierto(true);
        } else if (nuevoEstado === 'Regular' || nuevoEstado === 'Aprobada') {
            const yaRespondioEncuesta = misEncuestas.some(e => e.id_materia === nodoSeleccionado.id);
            const esTransicionRegularAAprobada = nodoSeleccionado.estadoActual === 'Regular' && nuevoEstado === 'Aprobada';

            if (yaRespondioEncuesta || esTransicionRegularAAprobada) {
                ejecutarCambioEstado(nuevoEstado);
            } else {
                setEstadoPendiente(nuevoEstado);
                setModalEncuestaAbierto(true);
            }
        } else {
            ejecutarCambioEstado(nuevoEstado);
        }
    };

    const ejecutarCambioEstado = async (nuevoEstado, idCurso = null) => {
        if (!nodoSeleccionado) return;
        try {
            setGuardando(true);
            await actualizarEstadoMateria(nodoSeleccionado.id, nuevoEstado, idCurso);

            setProgreso(prev => {
                const existe = prev.find(p => p.id_materia === nodoSeleccionado.id);
                if (existe) {
                    return prev.map(p => p.id_materia === nodoSeleccionado.id ? { ...p, estado: nuevoEstado } : p);
                }
                return [...prev, { id_materia: nodoSeleccionado.id, estado: nuevoEstado }];
            });

            // GATILLAR NOTIFICACIÓN CON HOMBRE DE PALO Y CONFETI SI ES APROBADA O REGULAR
            if (nuevoEstado === 'Aprobada' || nuevoEstado === 'Regular') {
                setNotificacionLogro({
                    tipo: nuevoEstado,
                    mensaje: nuevoEstado === 'Aprobada'
                        ? '¡Felicitaciones! Una materia menos, segui asi!'
                        : '¡Muy bienn! Que buen progreso!'
                });

                // Cierre automático tras 3 segundos
                setTimeout(() => {
                    setNotificacionLogro(null);
                }, 5000);
            }

            setModalComisionAbierto(false);
            setModalEncuestaAbierto(false);
            setEstadoPendiente(null);
        } catch (err) {
            console.error(err);
            alert("Hubo un error al guardar el estado.");
        } finally {
            setGuardando(false);
        }
    };

    if (error) {
        return <div className="text-red-500 p-8 bg-red-50 rounded-xl">{error}</div>;
    }

    return (
        <div ref={wrapperRef} className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative transition-all duration-300 ${isFullscreen ? 'h-screen w-screen p-0 rounded-none fixed inset-0 z-50' : 'h-[88vh] md:h-[82vh] min-h-[520px]'
            }`}>
            {/* Lluvia de confeti cuando se activa la notificación */}
            {notificacionLogro && <ConfettiRain />}

            {/* CARTEL FLOTANTE CON HOMBRE DE PALO SALTANDO Y TEXTO MOTIVACIONAL */}
            {notificacionLogro && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 border border-indigo-300/30">
                    <StickmanSaltando />
                    <div>
                        <p className="text-[10px] font-black tracking-widest uppercase opacity-80">¡EXCELENTE NOTICIA!</p>
                        <p className="text-sm font-extrabold">{notificacionLogro.mensaje}</p>
                    </div>
                    <button
                        onClick={() => setNotificacionLogro(null)}
                        className="ml-2 text-white/70 hover:text-white p-1 rounded-lg text-sm transition cursor-pointer border-none bg-transparent"
                        title="Cerrar"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Estilos CSS para la animación de caída de confeti */}
            <style>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-10px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-fall {
                    animation: fall linear forwards;
                }
            `}</style>

            {/* Barra superior */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 z-20 relative shadow-sm transition-colors duration-200">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-tight">Mi Progreso Académico</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Haz clic en una materia o utiliza el buscador para analizar su camino crítico.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Buscador */}
                    <div className="relative flex items-center min-w-[180px] sm:w-56">
                        <FiSearch className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={busquedaGrafo}
                            onChange={(e) => setBusquedaGrafo(e.target.value)}
                            placeholder="Buscar materia..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none transition text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
                        />
                        {busquedaGrafo && (
                            <button onClick={() => setBusquedaGrafo('')} className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs">✕</button>
                        )}
                    </div>

                    {/* Selector de Plan */}
                    {planes.length > 0 && (
                        <select
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
                        >
                            {planes.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    )}

                    {/* Botón Pantalla Completa */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border-none"
                    >
                        {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
                        <span className="hidden md:inline">{isFullscreen ? 'Restaurar' : 'Maximizar'}</span>
                    </button>
                </div>
            </div>

            {/* Lienzo del Grafo */}
            <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950 relative z-0 outline-none flex flex-col min-h-[400px] transition-colors duration-200">
                {cargando && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-30 transition-all">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Cargando mapa de correlatividades...</p>
                    </div>
                )}
                <div ref={containerRef} className="flex-1 w-full h-full" />

                {/* Minimapa Interactivo en esquina inferior derecha */}
                <div className="absolute bottom-4 right-4 w-40 h-28 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-10 hidden sm:block pointer-events-none transition-colors duration-200">
                    <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <FiCompass className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> Minimapa
                    </div>
                    <canvas ref={minimapCanvasRef} width="160" height="90" className="w-full h-[calc(100%-21px)] block" />
                </div>
            </div>

            {/* Leyenda de Colores + CONTROL HORIZONTAL DE ZOOM */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-3 text-xs text-slate-600 dark:text-slate-300">

                    {/* Estados de materias */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-[#d1fae5] dark:bg-emerald-950 border border-[#10b981]"></div> Aprobada</div>
                        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-[#fef3c7] dark:bg-amber-950 border border-[#f59e0b]"></div> Regular</div>
                        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-[#f3e8ff] dark:bg-purple-950 border border-[#a855f7]"></div> Cursando</div>
                        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-[#dbeafe] dark:bg-blue-950 border border-[#3b82f6]"></div> Habilitada</div>
                        <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-[#ffffff] dark:bg-slate-800 border border-[#cbd5e1] dark:border-slate-600"></div> Bloqueada</div>
                    </div>

                    {/* Tipos de Requisito + Control Horizontal de Zoom */}
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5"><div className="w-5 border-b-2 border-dashed border-slate-400 dark:border-slate-500"></div> Req. Regular</div>
                            <div className="flex items-center gap-1.5"><div className="w-5 border-b-2 border-solid border-indigo-400"></div> Req. Aprobada</div>
                        </div>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                        {/* Control Horizontal Interactivo de Zoom */}
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 shadow-2xs">
                            <button
                                onClick={() => cambiarZoom(zoomLevel - 15)}
                                className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer border-none bg-transparent"
                                title="Alejar zoom"
                            >
                                <FiMinus className="w-3.5 h-3.5 font-bold" />
                            </button>

                            <input
                                type="range"
                                min="10"
                                max="200"
                                step="5"
                                value={zoomLevel}
                                onChange={(e) => cambiarZoom(Number(e.target.value))}
                                className="w-24 h-1.5 accent-indigo-600 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />

                            <button
                                onClick={() => cambiarZoom(zoomLevel + 15)}
                                className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer border-none bg-transparent"
                                title="Acercar zoom"
                            >
                                <FiPlus className="w-3.5 h-3.5 font-bold" />
                            </button>

                            <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                            <button
                                onClick={() => cambiarZoom(100)}
                                className="px-1.5 py-0.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-extrabold transition cursor-pointer border-none bg-transparent flex items-center gap-1"
                                title="Restablecer vista a 100%"
                            >
                                <FiRotateCcw className="w-3 h-3" />
                                <span>{zoomLevel}%</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel Flotante de Edición */}
            {nodoSeleccionado && (
                <div 
                    className="absolute bottom-0 md:top-20 md:bottom-auto left-0 md:left-auto right-0 md:right-5 w-full md:w-88 lg:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl md:rounded-2xl shadow-2xl z-30 max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 transition-colors duration-200"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start p-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 transition-colors duration-200">
                        <div className="pr-2 min-w-0">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{nodoSeleccionado.nombre}</h2>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded inline-block">
                                Código: {nodoSeleccionado.codigo}
                            </span>
                        </div>
                        <button 
                            onClick={() => {
                                setNodoSeleccionado(null);
                                if (networkRef.current) {
                                    networkRef.current.unselectAll();
                                    networkRef.current.emit('click', { nodes: [] });
                                }
                            }} 
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer border-none bg-transparent"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto space-y-4 flex-1 min-h-0">
                        <div>
                            {nodoSeleccionado.correlativas?.length > 0 ? (
                                <div className="space-y-3">
                                    {nodoSeleccionado.correlativas.filter(c => (c.correlativas_x_materia?.tipo_requisito || 'regular') === 'regular').length > 0 && (
                                        <div>
                                            <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Para cursar (Regular):</h4>
                                            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                                {nodoSeleccionado.correlativas.filter(c => (c.correlativas_x_materia?.tipo_requisito || 'regular') === 'regular').map(c => {
                                                    const estadoCorrelativa = progreso.find(p => p.id_materia === c.id)?.estado || 'No Cursada';
                                                    const cumplido = estadoCorrelativa === 'Aprobada' || estadoCorrelativa === 'Regular';
                                                    return (
                                                        <li key={c.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1.5 rounded-lg">
                                                            <span className="truncate pr-2">{c.nombre}</span>
                                                            <span>{cumplido ? '✅' : '❌'}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {nodoSeleccionado.correlativas.filter(c => c.correlativas_x_materia?.tipo_requisito === 'aprobada').length > 0 && (
                                        <div>
                                            <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Para rendir final (Aprobada):</h4>
                                            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                                {nodoSeleccionado.correlativas.filter(c => c.correlativas_x_materia?.tipo_requisito === 'aprobada').map(c => {
                                                    const estadoCorrelativa = progreso.find(p => p.id_materia === c.id)?.estado || 'No Cursada';
                                                    const cumplido = estadoCorrelativa === 'Aprobada';
                                                    return (
                                                        <li key={c.id} className="flex justify-between items-center bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 px-2.5 py-1.5 rounded-lg">
                                                            <span className="truncate pr-2 text-indigo-950 dark:text-indigo-200">{c.nombre}</span>
                                                            <span>{cumplido ? '✅' : '❌'}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">Sin correlativas previas</p>
                            )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Cambiar Estado Académico:</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button disabled={guardando} onClick={() => handleCambiarEstado('Aprobada')} className={`py-2 px-3 text-xs rounded-xl border font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${nodoSeleccionado.estadoActual === 'Aprobada' ? 'bg-[#d1fae5] dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-500 font-bold' : 'bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>🟢 Aprobada</button>
                                <button disabled={guardando} onClick={() => handleCambiarEstado('Regular')} className={`py-2 px-3 text-xs rounded-xl border font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${nodoSeleccionado.estadoActual === 'Regular' ? 'bg-[#fef3c7] dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-500 font-bold' : 'bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>🟡 Regular</button>
                                <button disabled={guardando} onClick={() => handleCambiarEstado('Cursando')} className={`py-2 px-3 text-xs rounded-xl border font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${nodoSeleccionado.estadoActual === 'Cursando' ? 'bg-[#f3e8ff] dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-500 font-bold' : 'bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>🟣 Cursando</button>
                                <button disabled={guardando} onClick={() => handleCambiarEstado('No Cursada')} className={`py-2 px-3 text-xs rounded-xl border font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${nodoSeleccionado.estadoActual === 'No Cursada' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-500 font-bold' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>⚪ No Cursada</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalComisionAbierto && nodoSeleccionado && (
                <ModalSeleccionarComision
                    materia={nodoSeleccionado}
                    onConfirmar={(idCurso) => ejecutarCambioEstado('Cursando', idCurso)}
                    onCancelar={() => setModalComisionAbierto(false)}
                />
            )}

            {modalEncuestaAbierto && nodoSeleccionado && estadoPendiente && (
                <EncuestaCatedraObligatoria
                    materia={nodoSeleccionado}
                    nuevoEstado={estadoPendiente}
                    onCompletada={() => {
                        if (nodoSeleccionado) {
                            setMisEncuestas(prev => [...prev, { id_materia: nodoSeleccionado.id }]);
                        }
                        ejecutarCambioEstado(estadoPendiente);
                    }}
                    onCancelar={() => {
                        setModalEncuestaAbierto(false);
                        setEstadoPendiente(null);
                    }}
                />
            )}
        </div>
    );
};

export default MapaCorrelatividades;