import React, { useState } from 'react';
import axios from 'axios';
import { FiStar, FiCheckCircle, FiShield, FiMessageCircle, FiAward } from 'react-icons/fi';

const EncuestaCatedraObligatoria = ({ materia, nuevoEstado, onCompletada }) => {
  const [dificultad, setDificultad] = useState(0);
  const [claridadDocente, setClaridadDocente] = useState(0);
  const [disponibilidad, setDisponibilidad] = useState(0);
  const [esAnonima, setEsAnonima] = useState(true);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleEnviar = async (e) => {
    e.preventDefault();
    setError('');

    // Validar que el usuario haya seleccionado un valor para todas las categorías
    if (dificultad === 0 || claridadDocente === 0 || disponibilidad === 0) {
      setError('Por favor califica todos los aspectos requeridos (Dificultad, Claridad docente y Disponibilidad) antes de continuar.');
      return;
    }

    setEnviando(true);

    try {
      await axios.post(
        `${apiUrl}/encuestas-catedra`,
        {
          id_materia: materia.id,
          dificultad,
          claridad_docente: claridadDocente,
          disponibilidad,
          es_anonima: esAnonima,
          comentario: comentario.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Finalizar con éxito
      onCompletada();
    } catch (err) {
      console.error('Error al guardar encuesta de cátedra:', err);
      setError('Hubo un error al registrar tu encuesta. Por favor intentá nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const renderEstrellas = (valorActual, onChange, label, descripcion) => {
    return (
      <div
        onClick={(e) => {
          // Si hace clic en la tarjeta fuera del botón de una estrella, desmarca la calificación
          if (!e.target.closest('button')) {
            onChange(0);
          }
        }}
        className="space-y-1 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 select-none cursor-pointer"
        title="Hacé clic fuera de las estrellas para desmarcar"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 pointer-events-none">{label}</label>
          <span className={`text-xs font-extrabold font-mono pointer-events-none ${valorActual > 0 ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
            {valorActual > 0 ? `${valorActual}/5` : '-/5'}
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pointer-events-none">{descripcion}</p>
        <div className="flex items-center justify-center gap-3 pt-2 pb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Si hace clic en la misma estrella, la desmarca (0); si hace clic en otra, selecciona esa estrella
                onChange(valorActual === star ? 0 : star);
              }}
              className="p-1.5 text-lg transition-transform hover:scale-125 border-none bg-transparent cursor-pointer focus:outline-none"
              title={`Calificar con ${star} estrella${star > 1 ? 's' : ''} (o clic para desmarcar)`}
            >
              <FiStar
                className={`w-7 h-7 transition-colors pointer-events-none ${
                  valorActual > 0 && star <= valorActual
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
        
        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-black text-lg">
              📝
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                Encuesta de Cátedra al Finalizar Cursada
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Materia: <strong className="text-zinc-700 dark:text-zinc-200">{materia?.nombre}</strong> ({nuevoEstado})
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje */}
        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/40 rounded-2xl text-xs text-amber-900 dark:text-amber-300 leading-relaxed flex items-start gap-2.5">
          <FiAward className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            ¡Felicitaciones por completar la cursada! Tu opinión sincera ayuda a los próximos alumnos a conocer la dinámica docente y metodología de evaluación de la cátedra.
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleEnviar} className="space-y-3.5">
          {/* Criterios de Evaluación */}
          {renderEstrellas(
            dificultad,
            setDificultad,
            '1. Nivel de Dificultad y Exigencia',
            '1 = Muy accesible, 5 = Muy exigente y demandante'
          )}

          {renderEstrellas(
            claridadDocente,
            setClaridadDocente,
            '2. Claridad Pedagógica y Clases',
            '1 = Poco claro, 5 = Explicaciones excelentes y organizadas'
          )}

          {renderEstrellas(
            disponibilidad,
            setDisponibilidad,
            '3. Disponibilidad para Consultas y Trato',
            '1 = Poca predisposición, 5 = Muy atentos para resolver dudas'
          )}

          {/* Comentario Opcional */}
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
              Consejo o recomendación para futuros estudiantes (opcional)
            </label>
            <textarea
              rows={2}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="¿Qué tips le darías a alguien que está por cursar esta materia?..."
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 transition text-zinc-800 dark:text-zinc-200 resize-none"
            />
          </div>

          {/* Checkbox Anónimo */}
          <label className="flex items-center gap-2.5 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={esAnonima}
              onChange={(e) => setEsAnonima(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
              <FiShield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Publicar mi reseña de forma <strong>100% anónima</strong></span>
            </div>
          </label>

          {/* Botones */}
          <div className="flex items-center justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={enviando || dificultad === 0 || claridadDocente === 0 || disponibilidad === 0}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition border-none flex items-center justify-center gap-1.5 ${
                dificultad === 0 || claridadDocente === 0 || disponibilidad === 0
                  ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer hover:shadow'
              }`}
            >
              <FiCheckCircle className="w-4 h-4" />
              <span>{enviando ? 'Guardando...' : 'Enviar Encuesta y Guardar Estado'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EncuestaCatedraObligatoria;
