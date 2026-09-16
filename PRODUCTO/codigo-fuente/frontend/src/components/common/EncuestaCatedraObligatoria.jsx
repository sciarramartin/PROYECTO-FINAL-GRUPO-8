import React, { useState } from 'react';
import axios from 'axios';
import { FiStar, FiCheckCircle, FiShield, FiMessageCircle, FiAward } from 'react-icons/fi';

const EncuestaCatedraObligatoria = ({ materia, nuevoEstado, onCompletada, onCancelar }) => {
  const [dificultad, setDificultad] = useState(3);
  const [claridadDocente, setClaridadDocente] = useState(4);
  const [disponibilidad, setDisponibilidad] = useState(4);
  const [esAnonima, setEsAnonima] = useState(true);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleEnviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');

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
      <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800">{label}</label>
          <span className="text-xs font-extrabold text-amber-600 font-mono">{valorActual}/5</span>
        </div>
        <p className="text-[11px] text-slate-400">{descripcion}</p>
        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 text-lg transition hover:scale-110 border-none bg-transparent cursor-pointer"
            >
              <FiStar
                className={`w-6 h-6 transition ${
                  star <= valorActual
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
        
        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg">
              📝
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Encuesta de Cátedra al Finalizar Cursada
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Materia: <strong className="text-slate-700">{materia?.nombre}</strong> ({nuevoEstado})
              </p>
            </div>
          </div>
          {onCancelar && (
            <button
              onClick={onCancelar}
              className="text-slate-400 hover:text-slate-700 text-lg p-1 bg-transparent border-none cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mensaje */}
        <div className="p-3 bg-amber-50/60 border border-amber-100/80 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <FiAward className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            ¡Felicitaciones por completar la cursada! Tu opinión sincera ayuda a los próximos alumnos a conocer la dinámica docente y metodología de evaluación de la cátedra.
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-semibold">
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
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Consejo o recomendación para futuros estudiantes (opcional)
            </label>
            <textarea
              rows={2}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="¿Qué tips le darías a alguien que está por cursar esta materia?..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-amber-500 transition text-slate-800 resize-none"
            />
          </div>

          {/* Checkbox Anónimo */}
          <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={esAnonima}
              onChange={(e) => setEsAnonima(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <FiShield className="w-3.5 h-3.5 text-amber-600" />
              <span>Publicar mi reseña de forma <strong>100% anónima</strong></span>
            </div>
          </label>

          {/* Botones */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            {onCancelar && (
              <button
                type="button"
                onClick={onCancelar}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border-none cursor-pointer"
              >
                Omitir
              </button>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition border-none cursor-pointer flex items-center gap-1.5"
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
