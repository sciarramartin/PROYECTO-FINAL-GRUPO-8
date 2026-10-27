import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const GrafoCorrelativas = ({ materias }) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [esOscuro, setEsOscuro] = React.useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setEsOscuro(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !materias || materias.length === 0) return;

    const isDark = esOscuro;
    const nodes = new DataSet();
    const edges = new DataSet();

    // Llenar Nodos
    materias.forEach(materia => {
      const oculta = materia.visible_en_grafo === false || materia.visible_en_grafo === 0;
      nodes.add({
        id: materia.id,
        label: `${materia.codigo}\n${materia.nombre}${oculta ? '\n(Oculta)' : ''}`,
        level: parseInt(materia.nivel_anio) || 1, // Nivel explícito convertido a entero
        color: {
          background: oculta 
            ? (isDark ? '#1e293b' : '#f8fafc') 
            : (isDark ? '#0f172a' : '#ffffff'),
          border: oculta 
            ? (isDark ? '#475569' : '#94a3b8') 
            : (isDark ? '#334155' : '#cbd5e1'),
          highlight: { 
            background: isDark ? '#1e293b' : '#f8fafc', 
            border: '#6366f1' 
          }
        },
        font: { 
          face: 'Inter, sans-serif', 
          size: 14, 
          color: oculta 
            ? (isDark ? '#94a3b8' : '#64748b') 
            : (isDark ? '#f1f5f9' : '#1e293b') 
        },
        shape: 'box',
        widthConstraint: { maximum: 200 }, // Evita que se recorten los textos o se hagan minúsculos
        borderWidth: 2,
        borderRadius: 8,
        margin: 10,
        opacity: oculta ? 0.6 : 1,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.05)', size: 5, x: 0, y: 4 }
      });

      // Llenar Aristas
      if (materia.correlativas) {
        materia.correlativas.forEach(req => {
          const tipo = req.correlativas_x_materia?.tipo_requisito || 'regular';
          edges.add({
            id: `${req.id}-${materia.id}`, // ID explícito para poder actualizarla luego
            from: req.id,
            to: materia.id,
            arrows: 'to',
            color: { color: tipo === 'aprobada' ? (isDark ? 'rgba(129, 140, 248, 0.7)' : 'rgba(79, 70, 229, 0.6)') : (isDark ? 'rgba(100, 116, 139, 0.6)' : 'rgba(203, 213, 225, 0.8)') },
            width: tipo === 'aprobada' ? 2 : 1.5,
            dashes: tipo === 'regular' ? [5, 5] : false, // Punteada si es solo para cursar
            smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.6 } // Más ondulada
          });
        });
      }
    });

    const levelSeparation = 300;

    const data = { nodes, edges };
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

    // Dibujar columnas de fondo por año
    networkRef.current.on("beforeDrawing", function (ctx) {
      const colors = isDark
        ? ['#090d16', '#0f172a', '#0b1120', '#090d16', '#0f172a']
        : ['#f0f9ff', '#faf5ff', '#f0fdf4', '#fff7ed', '#fdf2f8'];
      
      const positions = networkRef.current.getPositions();
      const levelX = {};
      
      // Obtener la posición X promedio para cada nivel
      materias.forEach(m => {
        if (positions[m.id]) {
          // Guardamos la coordenada X de un nodo cualquiera de este nivel (todos los del mismo nivel tienen aprox la misma X en layout jerárquico)
          levelX[m.nivel_anio] = positions[m.id].x;
        }
      });

      // Dibujar las bandas verticales
      [1, 2, 3, 4, 5].forEach(year => {
        if (levelX[year] !== undefined) {
          const x = levelX[year];
          const bandWidth = levelSeparation;
          
          ctx.fillStyle = colors[year - 1];
          // Dibujamos un rectángulo enorme de alto para simular la columna infinita
          ctx.fillRect(x - bandWidth/2, -10000, bandWidth, 20000);
        }
      });
    });

    // Evento de Click para resaltar "hacia atrás"
    networkRef.current.on('click', function (params) {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        
        const ancestros = new Set();
        const ancestrosEdges = new Set();
        
        const encontrarAncestros = (id) => {
          const incomingEdges = edges.get().filter(e => e.to === id);
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

        // Actualizar Nodos
        nodes.forEach(node => {
          if (ancestros.has(node.id)) {
            nodes.update({ 
              id: node.id, 
              opacity: 1, 
              borderWidth: 3, 
              color: { border: '#4f46e5' } // Borde azul al resaltar
            });
          } else {
            nodes.update({ 
              id: node.id, 
              opacity: 0.2, 
              borderWidth: 1,
              color: { border: '#cbd5e1' }
            });
          }
        });

        // Actualizar Aristas (Flechas)
        edges.forEach(edge => {
          if (ancestrosEdges.has(edge.id)) {
            edges.update({
              id: edge.id,
              color: { color: '#4f46e5' }, // Resaltada en azul
              width: 3
            });
          } else {
            edges.update({
              id: edge.id,
              color: { color: 'rgba(203, 213, 225, 0.2)' }, // Súper tenue las no relacionadas
              width: 1
            });
          }
        });

      } else {
        // Resetear Nodos
        nodes.forEach(node => {
          nodes.update({ 
            id: node.id, 
            opacity: 1, 
            borderWidth: 2,
            color: { border: isDark ? '#334155' : '#cbd5e1' }
          });
        });
        
        // Resetear Aristas
        edges.forEach(edge => {
          edges.update({
            id: edge.id,
            color: { color: isDark ? 'rgba(100, 116, 139, 0.4)' : 'rgba(203, 213, 225, 0.4)' },
            width: 1
          });
        });
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [materias, esOscuro]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-[600px] flex flex-col transition-colors duration-200">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 relative shadow-sm transition-colors duration-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Vista previa del grafo</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Materias organizadas por año académico con sus dependencias</p>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 w-full bg-white dark:bg-slate-950 relative z-0 transition-colors duration-200" />
      
      {/* Leyenda */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Leyenda</h4>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-500 dark:text-slate-400 mr-2">Años:</span>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#f0f9ff] dark:bg-sky-950/40 border border-[#bae6fd] dark:border-sky-800"></div> 1° Año</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#faf5ff] dark:bg-purple-950/40 border border-[#e9d5ff] dark:border-purple-800"></div> 2° Año</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#f0fdf4] dark:bg-emerald-950/40 border border-[#bbf7d0] dark:border-emerald-800"></div> 3° Año</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#fff7ed] dark:bg-amber-950/40 border border-[#fed7aa] dark:border-amber-800"></div> 4° Año</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#fdf2f8] dark:bg-pink-950/40 border border-[#fbcfe8] dark:border-pink-800"></div> 5° Año</div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-500 dark:text-slate-400 mr-2">Requisitos:</span>
            <div className="flex items-center gap-2">
              <div className="w-6 border-b-2 border-dashed border-slate-400"></div> Regular (Cursar)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 border-b-2 border-solid border-indigo-500"></div> Aprobada (Rendir)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrafoCorrelativas;
