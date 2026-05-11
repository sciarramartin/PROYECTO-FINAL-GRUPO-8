import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const GrafoCorrelativas = ({ materias }) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !materias || materias.length === 0) return;

    const nodes = new DataSet();
    const edges = new DataSet();

    // Llenar Nodos (Todos del mismo color base, blanco)
    materias.forEach(materia => {
      nodes.add({
        id: materia.id,
        label: `${materia.codigo}\n${materia.nombre}`,
        level: materia.nivel_anio, // Nivel para el layout jerárquico
        color: {
          background: '#ffffff',
          border: '#cbd5e1',
          highlight: { background: '#f8fafc', border: '#64748b' }
        },
        font: { face: 'Inter, sans-serif', size: 14, multi: 'html', color: '#1e293b' },
        shape: 'box',
        borderWidth: 2,
        borderRadius: 8,
        margin: 10,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.05)', size: 5, x: 0, y: 4 }
      });

      // Llenar Aristas
      if (materia.correlativas) {
        materia.correlativas.forEach(req => {
          edges.add({
            id: `${req.id}-${materia.id}`, // ID explícito para poder actualizarla luego
            from: req.id,
            to: materia.id,
            arrows: 'to',
            color: { color: 'rgba(203, 213, 225, 0.4)' }, // Gris muy tenue por defecto
            width: 1,
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
          treeSpacing: 150,
          sortMethod: 'directed'
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
      const colors = ['#f0f9ff', '#faf5ff', '#f0fdf4', '#fff7ed', '#fdf2f8']; // Colores muy suaves
      
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
            color: { border: '#cbd5e1' }
          });
        });
        
        // Resetear Aristas
        edges.forEach(edge => {
          edges.update({
            id: edge.id,
            color: { color: 'rgba(203, 213, 225, 0.4)' },
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
  }, [materias]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[600px] flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Vista previa del grafo</h3>
          <p className="text-sm text-slate-500">Materias organizadas por año académico con sus dependencias</p>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 w-full bg-white relative z-0" />
      
      {/* Leyenda */}
      <div className="p-4 border-t border-slate-100 bg-white z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Columnas de Años</h4>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#f0f9ff] border border-[#bae6fd]"></div> 1° Año</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#faf5ff] border border-[#e9d5ff]"></div> 2° Año</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#f0fdf4] border border-[#bbf7d0]"></div> 3° Año</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#fff7ed] border border-[#fed7aa]"></div> 4° Año</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#fdf2f8] border border-[#fbcfe8]"></div> 5° Año</div>
        </div>
      </div>
    </div>
  );
};

export default GrafoCorrelativas;
