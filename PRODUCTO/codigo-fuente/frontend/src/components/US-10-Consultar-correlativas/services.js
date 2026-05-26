import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ 
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token (necesario para progreso)
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Materias
export const obtenerTodas = async () => {
    const res = await api.get('/materias');
    return res.data;
};

// Progreso
export const obtenerProgreso = async () => {
    const res = await api.get('/progreso');
    return res.data;
};

export const actualizarEstadoMateria = async (id_materia, estado) => {
    const res = await api.put(`/progreso/${id_materia}`, { estado });
    return res.data;
};
