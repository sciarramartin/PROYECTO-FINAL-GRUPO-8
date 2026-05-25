import axios from 'axios';

const API_URL =
    `${import.meta.env.VITE_API_URL}/actividad-personal`;

const token = localStorage.getItem("token") || sessionStorage.getItem("token");


export const getActividades = async (
    idUsuario
) => {

    try {

        const response = await axios.get(
            `${API_URL}`,
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

export const PostActividad = async (
    actividad
) => {

    try {

        const response = await axios.post(
            API_URL,
            actividad,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data;

    } catch (error) {

        console.error(
            'Error creando actividad:',
            error
        );

        throw error;
    }
};

export const PutActividad = async (
    actividad
) => {

    try {

        const response = await axios.put(
            `${API_URL}/${actividad.id}`,
            actividad,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data;

    } catch (error) {

        console.error(
            'Error actualizando actividad:',
            error
        );

        throw error;
    }
};

export const DeleteActividad = async (
    id
) => {

    try {

        const response = await axios.delete(
            `${API_URL}/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data;

    } catch (error) {

        console.error(
            'Error eliminando actividad:',
            error
        );

        throw error;
    }
};