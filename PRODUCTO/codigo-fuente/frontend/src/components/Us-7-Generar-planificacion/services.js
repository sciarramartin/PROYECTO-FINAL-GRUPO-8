import axios from 'axios';

const API_URL =
    `${import.meta.env.VITE_API_URL}`;

const token = localStorage.getItem("token") || sessionStorage.getItem("token");


export const getCursos = async () => {
    try {
        const cursados = await axios.get(
            `${API_URL}/inscripcion`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Esperar TODAS las promesas del segundo GET
        const cursosDetalles = await Promise.all(
            cursados.data.map(async (curso) => {
                const response = await axios.get(
                    `${API_URL}/cursos/${curso.idCurso}`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                return response.data;
            })
        );

        return cursosDetalles;
        
    } catch (error) {
        console.error('Error obteniendo actividades:', error);
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