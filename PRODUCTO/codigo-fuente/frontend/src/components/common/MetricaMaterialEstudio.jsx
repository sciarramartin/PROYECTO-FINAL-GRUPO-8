import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const TooltipInfo = ({ texto }) => (
    <span className="relative inline-flex items-center group cursor-pointer ml-1.5 align-middle select-none">
        <span
            className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] font-black transition-all group-hover:scale-110 opacity-75 group-hover:opacity-100"
        >
            !
        </span>

        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 border border-zinc-700">
            {texto}
        </span>
    </span>
);

const MetricaMaterialEstudio = () => {
    const [metricas, setMetricas] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarMetricas = async () => {
            try {
                const token =
                    localStorage.getItem('token') ||
                    sessionStorage.getItem('token');

                const apiUrl =
                    import.meta.env.VITE_API_URL ||
                    'http://localhost:3000/api';

                const response = await axios.get(
                    `${apiUrl}/metricas-material-estudio`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setMetricas(response.data);
            } catch (error) {
                console.error(
                    'Error cargando métricas de material de estudio:',
                    error
                );
            } finally {
                setCargando(false);
            }
        };

        cargarMetricas();
    }, []);

    if (cargando) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 animate-pulse">
                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-5"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"
                        />
                    ))}
                </div>

                <div className="h-80 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"></div>
            </div>
        );
    }

    if (!metricas) return null;

    const labels = metricas.evolucionMensual.map(
        m => m.periodo
    );

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Archivos',
                data: metricas.evolucionMensual.map(
                    m => m.archivos
                ),
                borderColor: '#0ea5e9',
                backgroundColor: '#0ea5e9',
                borderWidth: 3,
                tension: 0.35,
                yAxisID: 'y'
            },

            {
                label: 'Publicaciones',
                data: metricas.evolucionMensual.map(
                    m => m.publicaciones
                ),
                borderColor: '#f59e0b',
                backgroundColor: '#f59e0b',
                borderWidth: 3,
                tension: 0.35,
                yAxisID: 'y'
            },

            {
                label: 'Descargas',
                data: metricas.evolucionMensual.map(
                    m => m.descargas
                ),
                borderColor: '#10b981',
                backgroundColor: '#10b981',
                borderWidth: 3,
                tension: 0.35,
                yAxisID: 'y1'
            },

            {
                label: 'Likes',
                data: metricas.evolucionMensual.map(
                    m => m.likes
                ),
                borderColor: '#d946ef',
                backgroundColor: '#d946ef',
                borderWidth: 3,
                tension: 0.35,
                yAxisID: 'y1'
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            mode: 'index',
            intersect: false
        },

        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#71717a',
                    font: {
                        size: 11,
                        weight: 'bold'
                    }
                }
            }
        },

        scales: {
            y: {
                beginAtZero: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Archivos / Publicaciones'
                }
            },

            y1: {
                beginAtZero: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false
                },
                title: {
                    display: true,
                    text: 'Descargas / Likes'
                }
            }
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm p-6 space-y-5">

            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">

                <div>
                    <div className="flex items-center">
                        <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                            Material Académico e Interacción Comunitaria
                        </h3>

                        <TooltipInfo texto="Panel institucional orientado a auditar el crecimiento del repositorio documental, consumo de recursos y participación social de la comunidad académica." />
                    </div>

                    <p className="text-[11px] text-zinc-400">
                        Infraestructura, almacenamiento y valor generado por la comunidad
                    </p>
                </div>

                <span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 rounded-full text-[11px] font-bold border border-sky-200 dark:border-sky-900/40">
                    Admin / Institucional
                </span>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

                <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-900/40">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                            Archivos en Repositorio
                        </span>

                        <TooltipInfo texto="Cantidad total de documentos académicos almacenados en el campus virtual." />
                    </div>

                    <div className="mt-2 text-3xl font-black text-sky-900 dark:text-sky-300">
                        {metricas.resumen.totalArchivos}
                    </div>
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Descargas Comunidad
                        </span>

                        <TooltipInfo texto="Cantidad acumulada de descargas realizadas por los estudiantes sobre el material compartido." />
                    </div>

                    <div className="mt-2 text-3xl font-black text-emerald-900 dark:text-emerald-300">
                        {metricas.resumen.totalDescargas}
                    </div>
                </div>

                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Publicaciones Foro
                        </span>

                        <TooltipInfo texto="Total de publicaciones generadas por la comunidad académica." />
                    </div>

                    <div className="mt-2 text-3xl font-black text-amber-900 dark:text-amber-300">
                        {metricas.resumen.totalPublicaciones}
                    </div>
                </div>

                <div className="p-4 bg-fuchsia-50/50 dark:bg-fuchsia-950/20 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900/40">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-400">
                            Likes Comunidad
                        </span>

                        <TooltipInfo texto="Interacciones positivas realizadas sobre publicaciones y contenido compartido." />
                    </div>

                    <div className="mt-2 text-3xl font-black text-fuchsia-900 dark:text-fuchsia-300">
                        {metricas.resumen.totalLikes}
                    </div>
                </div>

            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">

                <div className="mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Evolución Histórica de Actividad Académica
                    </h4>

                    <p className="text-[11px] text-zinc-400 mt-1">
                        Seguimiento temporal del crecimiento documental y la actividad social del campus.
                    </p>
                </div>

                <div className="h-[420px]">
                    <Line
                        data={chartData}
                        options={chartOptions}
                    />
                </div>

            </div>

        </div>
    );
};

export default MetricaMaterialEstudio;

