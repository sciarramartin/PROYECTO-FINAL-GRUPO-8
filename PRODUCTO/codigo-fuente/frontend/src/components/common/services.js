import axios from 'axios';

const API_URL =
    `${import.meta.env.VITE_API_URL}`;

const token = localStorage.getItem("token") || sessionStorage.getItem("token");


export const getMetricasHorario = async () => {

    try {

        const response = await axios.get(
            `${API_URL}/actividad-personal/estadistica-horas`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data;

    } catch (error) {

        console.error(
            'Error obteniendo actividades:',
            error
        );

        throw error;
    }
};
