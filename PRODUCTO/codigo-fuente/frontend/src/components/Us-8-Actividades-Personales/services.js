import axios from 'axios';

const API_URL =
    'http://localhost:3000/api/actividad-personal';

export const getActividades = async (
    idUsuario
) => {

    try {

        const response = await axios.get(
            `${API_URL}/${idUsuario}`
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
            actividad
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
            `${API_URL}/${actividad.idUsuario}/${actividad.id}`,
            actividad
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
            `${API_URL}/${id}`
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