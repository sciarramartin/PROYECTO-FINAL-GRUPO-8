import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getMetricasHorario } from './services';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const limiteSaludable = 40;

const TooltipInfo = ({ texto }) => {
    return (
        <span className="relative inline-flex items-center group cursor-pointer ml-1.5 align-middle select-none">
            <span
                aria-label="Información sobre cálculo de métrica"
                className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] font-black transition-all group-hover:scale-110 opacity-75 group-hover:opacity-100"
            >
                !
            </span>
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 text-[11px] leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 border border-zinc-700 font-normal normal-case text-left">
                <span className="font-bold text-amber-300 dark:text-amber-400 block mb-1">📐 ¿Cómo se calcula?</span>
                {texto}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></span>
            </span>
        </span>
    );
};

const MetricaHorario = () => {
    const [metricas, setMetricas] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchMetricas = async () => {
            try {
                const response = await getMetricasHorario()
                setMetricas(response);
            } catch (err) {
                console.error('Error al cargar métricas de horario:', err);
            } finally {
                setCargando(false);
            }
        };

        fetchMetricas();
    }, []);

    if (cargando) {
        return (
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs animate-pulse">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
            </div>
        );
    }

    if (!metricas) return null;

    return (
        <div className="bg-white dark:bg-zinc-900 w-full rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                        ⏰
                    </div>

                    <div>
                        <div className="flex items-center">
                            <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                                Balance de carga horaria semanal
                            </h3>

                            <TooltipInfo texto="Comparación entre tu carga semanal registrada, el promedio de estudiantes de tu carrera y el límite recomendado para mantener un equilibrio saludable entre estudio, trabajo y vida personal." />
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Horas dedicadas por semana
                        </p>
                    </div>
                </div>
            </div>

            {/* Resumen superior */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-400">
                        Tu carga semanal
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-black text-indigo-900 dark:text-indigo-300">
                            {metricas.horasSemanales}
                        </span>

                        <span className="text-sm text-indigo-700 dark:text-indigo-400 mb-1">
                            hs
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl bg-zinc-50 border border-zinc-300 dark:border-zinc-800 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-200">
                        Promedio carrera
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-black text-zinc-500 dark:text-zinc-200">
                            {metricas.horasSemanalesPromedio}
                        </span>

                        <span className="text-sm text-zinc-500 dark:text-zinc-200 mb-1">
                            hs
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        Límite saludable
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-black text-emerald-900 dark:text-emerald-300">
                            40
                        </span>

                        <span className="text-sm text-emerald-700 dark:text-emerald-400 mb-1">
                            hs
                        </span>
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            <div className="h-40">
                <Bar
                    data={{
                        labels: [
                            `Tu carga semanal (${metricas.horasSemanales}h)`,
                            `Promedio carrera (${metricas.horasSemanalesPromedio}h)`,
                            `Límite saludable (40h)`
                        ],
                        datasets: [
                            {
                                label: 'Horas semanales',
                                data: [
                                    metricas.horasSemanales,
                                    metricas.horasSemanalesPromedio,
                                    40
                                ],
                                backgroundColor: [
                                    '#6366f1',
                                    '#d4d4d8',
                                    '#10b981'
                                ],
                                borderRadius: 12,
                                borderSkipped: false,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',

                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) =>
                                        `${context.raw} horas semanales`,
                                },
                            },
                        },

                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    callback: (value) => `${value}h`,
                                },
                                grid: {
                                    color: 'rgba(120,120,120,0.08)',
                                },
                            },

                            y: {
                                grid: {
                                    display: false,
                                },
                            },
                        },
                    }}
                />
            </div>

            {/* Estado */}
            {metricas.horasSemanales > 50 ? (
                <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⚠️</span>

                        <p className="font-semibold text-red-700 dark:text-red-400">
                            Riesgo de sobrecarga académica
                        </p>
                    </div>

                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        Tu carga semanal supera las 50 horas. Considera reducir
                        actividades laborales o académicas para evitar agotamiento,
                        disminuir el estrés y mejorar tu rendimiento general.
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">✅</span>

                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Carga horaria dentro de valores recomendados
                        </p>
                    </div>

                    <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-500">
                        Tu dedicación semanal se encuentra dentro de un rango
                        considerado saludable para combinar estudio, trabajo y vida
                        personal.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MetricaHorario;
