import React, { useState, useEffect } from 'react';

/**
 * Componente para calificar materiales con estrellas (Escenarios 1 y 2)
 */
export const CalificacionEstrellas = ({
    materialId,
    promedioInicial = 0,
    totalVotosInicial = 0,
    miCalificacionInicial = 0,
    onCalificacionActualizada
}) => {
    const [rating, setRating] = useState(miCalificacionInicial);
    const [hover, setHover] = useState(0);
    const [promedio, setPromedio] = useState(promedioInicial);
    const [totalVotos, setTotalVotos] = useState(totalVotosInicial);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        setPromedio(promedioInicial);
        setTotalVotos(totalVotosInicial);
        setRating(miCalificacionInicial);
    }, [promedioInicial, totalVotosInicial, miCalificacionInicial]);

    const handleCalificar = async (puntuacion) => {
        if (cargando) return;
        setCargando(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/repositorio/${materialId}/calificar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ puntuacion })
            });

            if (!response.ok) {
                throw new Error('Error al registrar la calificación');
            }

            const data = await response.json();

            setRating(puntuacion);
            setPromedio(data.promedio);
            setTotalVotos(data.totalVotos);

            if (onCalificacionActualizada) {
                onCalificacionActualizada({
                    materialId,
                    promedio: data.promedio,
                    totalVotos: data.totalVotos,
                    miCalificacion: puntuacion
                });
            }

        } catch (error) {
            console.error('Error al calificar material:', error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                    const activa = (hover || rating) >= star;
                    return (
                        <button
                            key={star}
                            type="button"
                            disabled={cargando}
                            onClick={() => handleCalificar(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            title={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: cargando ? 'wait' : 'pointer',
                                fontSize: '20px',
                                padding: '0 1px',
                                color: activa ? '#f59e0b' : '#d1d5db',
                                transition: 'color 0.15s ease'
                            }}
                        >
                            ★
                        </button>
                    );
                })}
            </div>

            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>
                {promedio > 0 ? (
                    <>
                        {promedio} <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>({totalVotos})</span>
                    </>
                ) : (
                    <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>Sin votos</span>
                )}
            </span>
        </div>
    );
};