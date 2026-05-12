import axios from "axios";

const getActividades = async (idUsuario) => {
    try {
        const respuesta = await axios.get(`http://localhost:3000/api/actividad-personal/${idUsuario}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al obtener las actividades:", error);
        throw error;
    }
};

const PostActividad = async (actividad) => {
    try {
        const respuesta = await axios.post(`http://localhost:3000/api/actividad-personal`, actividad);
        return respuesta.data;
    } catch (error) {
        console.error("Error al crear la actividad:", error);
        throw error;
    }
};

export { getActividades, PostActividad };