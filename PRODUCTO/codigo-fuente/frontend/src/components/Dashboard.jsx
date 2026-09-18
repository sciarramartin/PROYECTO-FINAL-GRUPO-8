import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import ProgresoCurricularCard from './common/ProgresoCurricularCard';
import ProyeccionGraduacion from './common/ProyeccionGraduacion';
import MetricaGraduados from './common/MetricaGraduados';
import InsigniaGraduado from './common/InsigniaGraduado';
import MetricaHorario from './common/MetricaHorario';
import { FiGrid, FiAward, FiBarChart2, FiUser, FiInfo, FiLayers, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
  const [estadoGraduacion, setEstadoGraduacion] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchDatosEstudiante = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        // Consultar estado de graduación personal
        const resGrad = await axios.get(`${apiUrl}/progreso/estado-graduacion`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEstadoGraduacion(resGrad.data);

        // Consultar datos del usuario activo
        const resUser = await axios.get(`${apiUrl}/usuarios/perfil`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuario(resUser.data);
      } catch (err) {
        console.error('Error al cargar datos de usuario en Dashboard:', err);
      }
    };

    fetchDatosEstudiante();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
        
        {/* Encabezado Principal del Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Dashboard Estudiantil & Métricas Académicas
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Visualiza tu avance curricular, simula tus tiempos de graduación y monitorea tu trayectoria en UTN FRC.
            </p>
          </div>

          {/* Insignia de Honor si el estudiante ya es graduado (US-MET-11) */}
          {estadoGraduacion?.esGraduado && (
            <div className="flex items-center">
              <InsigniaGraduado carrera="Ingeniería en Sistemas" />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 📚 SECCIÓN 1: ANALÍTICAS Y TOMA DE DECISIONES DEL ESTUDIANTE               */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <h2 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Métricas Personales de Avance y Graduación
              </h2>
            </div>
            {/* Acceso directo a Historial de Cursadas y Recursadas (US-MET-04) */}
            <Link 
              to="/materias" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200/60 shadow-xs"
            >
              <FiLayers className="w-3.5 h-3.5" />
              <span>Ver Cursadas y Recursadas</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* US-MET-02: Progreso Curricular y Cumplimiento de Electivas */}
          <ProgresoCurricularCard />

          {/* US-MET-03: Proyección de Graduación con Simulador Interactivo */}
          <ProyeccionGraduacion />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <MetricaHorario/>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🏛️ SECCIÓN 2: ANALÍTICAS INSTITUCIONALES (US-MET-11)                       */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <h2 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Panel Institucional de Analíticas (Administración & Autoridades)
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400">
              Datos globales consolidados
            </span>
          </div>

          {/* US-MET-11: Métricas de Graduados, Tasa de Egreso y Duración de Carrera */}
          <MetricaGraduados />
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;