import React, { useEffect, useState, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { obtenerTodas, obtenerProgreso, actualizarEstadoMateria } from './services';

const MapaCorrelatividades = () => {
    const containerRef = useRef(null);
    const networkRef = useRef(null);
    const nodesRef = useRef(null);
    const edgesRef = useRef(null);

    const [materias, setMaterias] = useState([]);
    const [progreso, setProgreso] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [nodoSeleccionado, setNodoSeleccionado] = useState(null);
    const [guardando, setGuardando] = useState(false);

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

            const [materiasData, progresoData] = await Promise.all([
                obtenerTodas(id_carrera),
                obtenerProgreso()
            ]);
            
            // Filtrar materias que no están visibles
            const materiasVisibles = materiasData.filter(m => m.visible_en_grafo !== false && m.visible_en_grafo !== 0);
            
            setMaterias(materiasVisibles);
            setProgreso(progresoData);
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
    }, [materias]); 

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

    const handleCambiarEstado = async (nuevoEstado) => {
        if (!nodoSeleccionado) return;
        try {
            setGuardando(true);
            await actualizarEstadoMateria(nodoSeleccionado.id, nuevoEstado);
            
            setProgreso(prev => {
                const existe = prev.find(p => p.id_materia === nodoSeleccionado.id);
                if (existe) {
                    return prev.map(p => p.id_materia === nodoSeleccionado.id ? { ...p, estado: nuevoEstado } : p);
                }
                return [...prev, { id_materia: nodoSeleccionado.id, estado: nuevoEstado }];
            });
            // El useEffect de arriba se encargará de refrescar la UI

        } catch (err) {
            console.error(err);
            alert("Hubo un error al guardar el estado.");
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-slate-700 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Cargando grafo...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-8 bg-red-50 rounded-xl">{error}</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[85vh] md:h-[75vh] flex flex-col relative">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative shadow-sm">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Mi Progreso</h3>
                    <p className="text-sm text-slate-500">Haz clic en una materia para actualizar su estado y ver sus correlativas.</p>
                </div>
            </div>

            {/* Lienzo del Grafo */}
            <div ref={containerRef} className="flex-1 w-full bg-white relative z-0 outline-none" />
            
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
                <div className="absolute bottom-0 md:top-24 md:bottom-auto left-0 md:left-auto right-0 md:right-6 w-full md:w-80 bg-white border border-slate-200 p-6 rounded-t-2xl md:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-xl z-20 max-h-[60vh] md:max-h-none overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-slate-800">{nodoSeleccionado.nombre}</h2>
                        <button onClick={() => {
                            setNodoSeleccionado(null);
                            if (networkRef.current) {
                                // Forzar click en el fondo para limpiar
                                networkRef.current.unselectAll();
                                networkRef.current.emit('click', { nodes: [] });
                            }
                        }} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
                    </div>
                    
                    <p className="text-xs text-slate-500 font-mono mb-4 border border-slate-100 bg-slate-50 inline-block px-2 py-1 rounded">
                        Código: {nodoSeleccionado.codigo}
                    </p>
                    
                    <div className="mb-4">
                        {nodoSeleccionado.correlativas?.length > 0 ? (
                            <div className="space-y-4">
                                {/* Lista de Regulares */}
                                {nodoSeleccionado.correlativas.filter(c => (c.correlativas_x_materia?.tipo_requisito || 'regular') === 'regular').length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Para cursar (Regular):</h4>
                                        <ul className="text-sm text-slate-700 space-y-1">
                                            {nodoSeleccionado.correlativas.filter(c => (c.correlativas_x_materia?.tipo_requisito || 'regular') === 'regular').map(c => {
                                                const estadoCorrelativa = progreso.find(p => p.id_materia === c.id)?.estado || 'No Cursada';
                                                const cumplido = estadoCorrelativa === 'Aprobada' || estadoCorrelativa === 'Regular';
                                                return (
                                                    <li key={c.id} className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                                                        <span className="truncate pr-2">{c.nombre}</span>
                                                        <span>{cumplido ? '✅' : '❌'}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                                {/* Lista de Aprobadas */}
                                {nodoSeleccionado.correlativas.filter(c => c.correlativas_x_materia?.tipo_requisito === 'aprobada').length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-indigo-500 uppercase mb-2">Para rendir final (Aprobada):</h4>
                                        <ul className="text-sm text-slate-700 space-y-1">
                                            {nodoSeleccionado.correlativas.filter(c => c.correlativas_x_materia?.tipo_requisito === 'aprobada').map(c => {
                                                const estadoCorrelativa = progreso.find(p => p.id_materia === c.id)?.estado || 'No Cursada';
                                                const cumplido = estadoCorrelativa === 'Aprobada';
                                                return (
                                                    <li key={c.id} className="flex justify-between items-center bg-indigo-50 px-2 py-1 rounded">
                                                        <span className="truncate pr-2 text-indigo-900">{c.nombre}</span>
                                                        <span>{cumplido ? '✅' : '❌'}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Requisitos:</h4>
                                <p className="text-sm text-slate-400 italic">Sin correlativas</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Actualizar:</h4>
                        <div className="flex flex-col gap-2">
                            <button disabled={guardando} onClick={() => handleCambiarEstado('Aprobada')} className={`py-2 px-3 text-sm rounded-lg border font-medium transition-colors ${nodoSeleccionado.estadoActual === 'Aprobada' ? 'bg-[#d1fae5] text-emerald-800 border-emerald-400 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}>
                                Aprobada
                            </button>
                            <button disabled={guardando} onClick={() => handleCambiarEstado('Regular')} className={`py-2 px-3 text-sm rounded-lg border font-medium transition-colors ${nodoSeleccionado.estadoActual === 'Regular' ? 'bg-[#fef3c7] text-amber-800 border-amber-400 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}>
                                Regular
                            </button>
                            <button disabled={guardando} onClick={() => handleCambiarEstado('Cursando')} className={`py-2 px-3 text-sm rounded-lg border font-medium transition-colors ${nodoSeleccionado.estadoActual === 'Cursando' ? 'bg-[#f3e8ff] text-purple-800 border-purple-400 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}>
                                Cursando
                            </button>
                            <button disabled={guardando} onClick={() => handleCambiarEstado('No Cursada')} className={`py-2 px-3 text-sm rounded-lg border font-medium transition-colors ${nodoSeleccionado.estadoActual === 'No Cursada' ? 'bg-slate-100 text-slate-800 border-slate-400 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}>
                                No Cursada
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapaCorrelatividades;
