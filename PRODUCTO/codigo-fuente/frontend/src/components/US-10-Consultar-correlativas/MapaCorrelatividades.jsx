import React, { useEffect, useState, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import axios from 'axios';
import { obtenerTodas, obtenerProgreso, actualizarEstadoMateria } from './services';
import ModalSeleccionarComision from './ModalSeleccionarComision';
import EncuestaCatedraObligatoria from '../common/EncuestaCatedraObligatoria';

const MapaCorrelatividades = () => {
    const containerRef = useRef(null);
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

    const colores = {
        aprobada: { background: '#d1fae5', border: '#10b981' }, 
        regular: { background: '#fef3c7', border: '#f59e0b' },   
        cursando: { background: '#f3e8ff', border: '#a855f7' },
        habilitada: { background: '#dbeafe', border: '#3b82f6' }, 
        bloqueada: { background: '#ffffff', border: '#cbd5e1' }, // Igual al nodo base en GrafoCorrelativas
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
                return estadoReq === 'Aprobada'; // Exigencia fuerte
            } else {
                return estadoReq === 'Aprobada' || estadoReq === 'Regular'; // Exigencia débil
            }
        });

        return cumpleRequisitos ? 'habilitada' : 'bloqueada';
    };

    const actualizarNodosVisuales = () => {
        if (!materias.length || !nodesRef.current) return;

        const mapEstados = {};
        progreso.forEach(p => { mapEstados[p.id_materia] = p.estado; });

        // Sólo actualizamos colores y texto, no borramos el grafo entero
        nodesRef.current.forEach(node => {
            const estadoBase = mapEstados[node.id] || 'No Cursada';
            const estadoCalculado = getEstadoCalculado(node.id, estadoBase, mapEstados, materias);
            const palette = colores[estadoCalculado];
            
            // Para mantener la propiedad 'materiaNombre' original:
            const m = materias.find(mat => mat.id === node.id);
            if (!m) return;

            nodesRef.current.update({
                id: node.id,
                label: `${m.nombre}\n${estadoBase}`, // Solo nombre y estado
                estadoCalculado,
                color: {
                    background: palette.background,
                    border: palette.border,
                    highlight: { background: palette.background, border: '#4f46e5' }
                }
            });
        });
    };

    // Inicialización del grafo IDÉNTICA a GrafoCorrelativas
    useEffect(() => {
        if (cargando || error || !containerRef.current || materias.length === 0) return;
        if (networkRef.current) return;

        nodesRef.current = new DataSet();
        edgesRef.current = new DataSet();

        // 1. Crear nodos (con valores por defecto, luego actualizarNodosVisuales pondrá los colores)
        materias.forEach(materia => {
            nodesRef.current.add({
                id: materia.id,
                label: `${materia.nombre}\nCargando...`,
                level: parseInt(materia.nivel_anio) || 1,
                color: {
                    background: '#ffffff',
                    border: '#cbd5e1',
                    highlight: { background: '#f8fafc', border: '#64748b' }
                },
                font: { face: 'Inter, sans-serif', size: 14, color: '#1e293b' },
                shape: 'box',
                widthConstraint: { maximum: 200 },
                borderWidth: 2,
                borderRadius: 8,
                margin: 10,
                shadow: { enabled: true, color: 'rgba(0,0,0,0.05)', size: 5, x: 0, y: 4 }
            });

            // 2. Crear Aristas
            if (materia.correlativas) {
                materia.correlativas.forEach(req => {
                    const tipo = req.correlativas_x_materia?.tipo_requisito || 'regular';
                    edgesRef.current.add({
                        id: `${req.id}-${materia.id}`,
                        from: req.id,
                        to: materia.id,
                        arrows: 'to',
                        color: { color: tipo === 'aprobada' ? 'rgba(79, 70, 229, 0.4)' : 'rgba(203, 213, 225, 0.8)' },
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
                zoomView: true,
                dragView: true
            }
        };

        networkRef.current = new Network(containerRef.current, data, options);

        // Dibujar columnas pastel (Idéntico a GrafoCorrelativas)
        networkRef.current.on("beforeDrawing", function (ctx) {
            const colorsBg = ['#f0f9ff', '#faf5ff', '#f0fdf4', '#fff7ed', '#fdf2f8'];
            const yearNames = ['1° Año', '2° Año', '3° Año', '4° Año', '5° Año'];
            const positions = networkRef.current.getPositions();
            const levelX = {};
            
            materias.forEach(m => {
                if (positions[m.id]) {
                    levelX[m.nivel_anio] = positions[m.id].x;
                }
            });

            [1, 2, 3, 4, 5].forEach(year => {
                if (levelX[year] !== undefined) {
                    const x = levelX[year];
                    const bandWidth = levelSeparation;
                    
                    ctx.fillStyle = colorsBg[year - 1];
                    ctx.fillRect(x - bandWidth/2, -10000, bandWidth, 20000);

                    // Pequeño título del año para orientación visual (Opcional, pero útil)
                    const viewPos = networkRef.current.getViewPosition();
                    const scale = networkRef.current.getScale();
                    const textY = viewPos.y - (containerRef.current.clientHeight / 2) / scale + 40 / scale;
                    
                    ctx.font = `bold ${Math.max(20, 20/scale)}px Inter, sans-serif`;
                    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
                    ctx.textAlign = "center";
                    ctx.fillText(yearNames[year - 1], x, textY);
                }
            });
        });

        actualizarNodosVisuales();

        // Evento Click idéntico a GrafoCorrelativas
        networkRef.current.on('click', function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const materiaSelect = materias.find(m => m.id === nodeId);
                
                // Setear panel lateral
                const mapEstados = {};
                progreso.forEach(p => { mapEstados[p.id_materia] = p.estado; });
                const estadoActual = mapEstados[nodeId] || 'No Cursada';
                setNodoSeleccionado({ ...materiaSelect, estadoActual });

                // Lógica de resaltado
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

                // Re-colorear Nodos y opacidad
                nodesRef.current.forEach(node => {
                    if (ancestros.has(node.id)) {
                        nodesRef.current.update({ 
                            id: node.id, 
                            opacity: 1, 
                            borderWidth: 3, 
                            color: { border: '#4f46e5' } // Azul remarcado
                        });
                    } else {
                        // Respetar su background original pero atenuarlo
                        nodesRef.current.update({ 
                            id: node.id, 
                            opacity: 0.2, 
                            borderWidth: 1,
                            color: { border: '#cbd5e1' }
                        });
                    }
                });

                // Re-colorear Aristas
                edgesRef.current.forEach(edge => {
                    if (ancestrosEdges.has(edge.id)) {
                        edgesRef.current.update({
                            id: edge.id,
                            color: { color: '#4f46e5' },
                            width: 3
                        });
                    } else {
                        edgesRef.current.update({
                            id: edge.id,
                            color: { color: 'rgba(203, 213, 225, 0.2)' },
                            width: 1
                        });
                    }
                });

            } else {
                // Click en el fondo: Limpiar todo
                setNodoSeleccionado(null);
                
                // Restaurar la opacidad y los bordes al original definidos en colores
                const mapEstados = {};
                progreso.forEach(p => { mapEstados[p.id_materia] = p.estado; });

                nodesRef.current.forEach(node => {
                    const estadoBase = mapEstados[node.id] || 'No Cursada';
                    const estadoCalculado = getEstadoCalculado(node.id, estadoBase, mapEstados, materias);
                    const palette = colores[estadoCalculado];

                    nodesRef.current.update({ 
                        id: node.id, 
                        opacity: 1, 
                        borderWidth: 2,
                        color: { border: palette.border }
                    });
                });
                
                // Restaurar las aristas
                edgesRef.current.forEach(edge => {
                    // Hay que buscar si era aprobada o regular para restaurarla bien
                    // Es costoso buscar en cada click, así que podemos leer sus properties si las guardáramos, 
                    // o simplemente restaurar el color sutil por defecto (que igual respeta dashed)
                    edgesRef.current.update({
                        id: edge.id,
                        color: { color: 'rgba(203, 213, 225, 0.8)' }
                    });
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

    // Al cambiar progreso, repintamos colores
    useEffect(() => {
        if (materias.length > 0) {
            actualizarNodosVisuales();
        }
    }, [progreso]);

    // Cada vez que cambia el nodo seleccionado o el progreso, nos aseguramos que el panel se refresque
    useEffect(() => {
        if (nodoSeleccionado && progreso) {
            const mapEstados = {};
            progreso.forEach(p => { mapEstados[p.id_materia] = p.estado; });
            const estadoActual = mapEstados[nodoSeleccionado.id] || 'No Cursada';
            
            if (nodoSeleccionado.estadoActual !== estadoActual) {
                setNodoSeleccionado(prev => ({ ...prev, estadoActual }));
            }
        }
    }, [progreso]);

    const handleCambiarEstado = (nuevoEstado) => {
        if (!nodoSeleccionado) return;
        
        if (nuevoEstado === 'Cursando') {
            setModalComisionAbierto(true);
        } else if (nuevoEstado === 'Regular' || nuevoEstado === 'Aprobada') {
            // Verificar si el alumno ya respondió la encuesta para esta materia,
            // o si está pasando de Regular a Aprobada (ya evaluó la cursada al quedar Regular).
            const yaRespondioEncuesta = misEncuestas.some(e => e.id_materia === nodoSeleccionado.id);
            const esTransicionRegularAAprobada = nodoSeleccionado.estadoActual === 'Regular' && nuevoEstado === 'Aprobada';

            if (yaRespondioEncuesta || esTransicionRegularAAprobada) {
                // No pedir encuesta duplicada, guardar estado directamente
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[88vh] md:h-[82vh] min-h-[520px] flex flex-col relative">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10 relative shadow-sm">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Mi Progreso</h3>
                    <p className="text-sm text-slate-500">Haz clic en una materia para actualizar su estado y ver sus correlativas.</p>
                </div>
                {planes.length > 0 && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="plan-selector" className="text-sm font-medium text-slate-700 whitespace-nowrap">Plan de Estudio:</label>
                        <select
                            id="plan-selector"
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 font-medium cursor-pointer max-w-xs"
                        >
                            {planes.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Lienzo del Grafo */}
            <div className="flex-1 w-full bg-white relative z-0 outline-none flex flex-col min-h-[400px]">
                {cargando && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-30 transition-all">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-sm text-slate-600 font-medium">Cargando grafo...</p>
                    </div>
                )}
                <div ref={containerRef} className="flex-1 w-full h-full" />
            </div>
            
            {/* Leyenda de Colores */}
            <div className="p-4 border-t border-slate-100 bg-white z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Estados de Materias y Requisitos</h4>
                <div className="flex flex-col md:flex-row gap-6 text-xs text-slate-600">
                    <div className="flex flex-wrap gap-4 border-r pr-6 border-slate-200">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#d1fae5] border border-[#10b981]"></div> Aprobada</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#fef3c7] border border-[#f59e0b]"></div> Regular</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#f3e8ff] border border-[#a855f7]"></div> Cursando</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#dbeafe] border border-[#3b82f6]"></div> Habilitada</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#ffffff] border border-[#cbd5e1]"></div> Bloqueada</div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                        <div className="w-6 border-b-2 border-dashed border-slate-400"></div> Requisito Regular (Cursar)
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-6 border-b-2 border-solid border-indigo-400"></div> Requisito Aprobada (Rendir)
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel Flotante de Edición */}
            {nodoSeleccionado && (
                <div 
                    className="absolute bottom-0 md:top-20 md:bottom-auto left-0 md:left-auto right-0 md:right-5 w-full md:w-88 lg:w-96 bg-white border border-slate-200 rounded-t-2xl md:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.18)] md:shadow-2xl z-30 max-h-[80vh] md:max-h-[calc(100%-6rem)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-200"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    {/* Header fijo */}
                    <div className="flex justify-between items-start p-4 sm:p-5 pb-3 border-b border-slate-100 bg-white shrink-0">
                        <div className="pr-2 min-w-0">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">
                                {nodoSeleccionado.nombre}
                            </h2>
                            <span className="text-[11px] text-slate-500 font-mono mt-1 border border-slate-200 bg-slate-50 inline-block px-2 py-0.5 rounded">
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
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-base transition-colors cursor-pointer shrink-0"
                            title="Cerrar panel"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Cuerpo scrolleable con overscroll aislado */}
                    <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 min-h-0 overscroll-contain">
                        {/* Correlativas */}
                        <div>
                            {nodoSeleccionado.correlativas?.length > 0 ? (
                                <div className="space-y-3">
                                    {/* Lista de Regulares */}
                                    {nodoSeleccionado.correlativas.filter(c => (c.correlativas_x_materia?.tipo_requisito || 'regular') === 'regular').length > 0 && (
                                        <div>
                                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Para cursar (Regular):
                                            </h4>
                                            <ul className="text-xs sm:text-sm text-slate-700 space-y-1">
                                                {nodoSeleccionado.correlativas.filter(c => (c.correlativas_x_materia?.tipo_requisito || 'regular') === 'regular').map(c => {
                                                    const estadoCorrelativa = progreso.find(p => p.id_materia === c.id)?.estado || 'No Cursada';
                                                    const cumplido = estadoCorrelativa === 'Aprobada' || estadoCorrelativa === 'Regular';
                                                    return (
                                                        <li key={c.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg">
                                                            <span className="truncate pr-2">{c.nombre}</span>
                                                            <span className="shrink-0">{cumplido ? '✅' : '❌'}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {/* Lista de Aprobadas */}
                                    {nodoSeleccionado.correlativas.filter(c => c.correlativas_x_materia?.tipo_requisito === 'aprobada').length > 0 && (
                                        <div>
                                            <h4 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1.5">
                                                Para rendir final (Aprobada):
                                            </h4>
                                            <ul className="text-xs sm:text-sm text-slate-700 space-y-1">
                                                {nodoSeleccionado.correlativas.filter(c => c.correlativas_x_materia?.tipo_requisito === 'aprobada').map(c => {
                                                    const estadoCorrelativa = progreso.find(p => p.id_materia === c.id)?.estado || 'No Cursada';
                                                    const cumplido = estadoCorrelativa === 'Aprobada';
                                                    return (
                                                        <li key={c.id} className="flex justify-between items-center bg-indigo-50/70 border border-indigo-100 px-2.5 py-1.5 rounded-lg">
                                                            <span className="truncate pr-2 text-indigo-950">{c.nombre}</span>
                                                            <span className="shrink-0">{cumplido ? '✅' : '❌'}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Requisitos:
                                    </h4>
                                    <p className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        Sin correlativas previas
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Botones de Actualización de Estado (2x2 Grid para acceso instantáneo a No Cursada) */}
                        <div className="pt-3 border-t border-slate-100 pb-3">
                            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                                Cambiar Estado Académico:
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    disabled={guardando} 
                                    onClick={() => handleCambiarEstado('Aprobada')} 
                                    className={`py-2 px-3 text-xs sm:text-sm rounded-xl border font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                                        nodoSeleccionado.estadoActual === 'Aprobada' 
                                            ? 'bg-[#d1fae5] text-emerald-800 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20' 
                                            : 'bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-700 hover:border-emerald-300'
                                    }`}
                                >
                                    <span>🟢</span> Aprobada
                                </button>
                                <button 
                                    disabled={guardando} 
                                    onClick={() => handleCambiarEstado('Regular')} 
                                    className={`py-2 px-3 text-xs sm:text-sm rounded-xl border font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                                        nodoSeleccionado.estadoActual === 'Regular' 
                                            ? 'bg-[#fef3c7] text-amber-800 border-amber-500 shadow-xs ring-2 ring-amber-500/20' 
                                            : 'bg-white hover:bg-amber-50/50 border-slate-200 text-slate-700 hover:border-amber-300'
                                    }`}
                                >
                                    <span>🟡</span> Regular
                                </button>
                                <button 
                                    disabled={guardando} 
                                    onClick={() => handleCambiarEstado('Cursando')} 
                                    className={`py-2 px-3 text-xs sm:text-sm rounded-xl border font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                                        nodoSeleccionado.estadoActual === 'Cursando' 
                                            ? 'bg-[#f3e8ff] text-purple-800 border-purple-500 shadow-xs ring-2 ring-purple-500/20' 
                                            : 'bg-white hover:bg-purple-50/50 border-slate-200 text-slate-700 hover:border-purple-300'
                                    }`}
                                >
                                    <span>🟣</span> Cursando
                                </button>
                                <button 
                                    disabled={guardando} 
                                    onClick={() => handleCambiarEstado('No Cursada')} 
                                    className={`py-2 px-3 text-xs sm:text-sm rounded-xl border font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                                        nodoSeleccionado.estadoActual === 'No Cursada' 
                                            ? 'bg-slate-200 text-slate-900 border-slate-500 shadow-xs ring-2 ring-slate-400/20 font-bold' 
                                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span>⚪</span> No Cursada
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Selección de Comisión (SCRUM-100) */}
            {modalComisionAbierto && nodoSeleccionado && (
                <ModalSeleccionarComision
                    materia={nodoSeleccionado}
                    onConfirmar={(idCurso) => ejecutarCambioEstado('Cursando', idCurso)}
                    onCancelar={() => setModalComisionAbierto(false)}
                />
            )}

            {/* Modal Encuesta de Cátedra Obligatoria (SCRUM-85) */}
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
