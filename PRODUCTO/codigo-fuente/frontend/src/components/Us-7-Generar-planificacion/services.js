// frontend/src/components/Us-7-Generar-planificacion/services.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}`;

// 1. Obtener los detalles de los cursos del alumno
export const getCursos = async () => {
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        const cursados = await axios.get(
            `${API_URL}/inscripcion`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        // TEST 1: Ver qué devuelve el estado de materias del alumno
        console.log("Respuesta de /estado-materias:", cursados.data);
        
        const cursosDetalles = await Promise.all(
            cursados.data.map(async (curso) => {
                const response = await axios.get(
                    `${API_URL}/cursos/${curso.idCurso}`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                return response.data;
            })
        );

        // 🔍 TEST 2: Ver el array final compilado de materias
        console.log("Materias finales listas para el Front:", cursosDetalles);
       

        return cursosDetalles;
        
    } catch (error) {
        console.error('Error obteniendo actividades:', error);
        throw error;
    }
};

// 2. Obtener las actividades flexibles
export const getActividadesFlexibles = async () => {
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const respuesta = await axios.get(`${API_URL}/planificador/actividades-flexibles`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return respuesta.data;
    } catch (error) {
        console.error("Error en getActividadesFlexibles:", error);
        throw error;
    }
};

// 3. Crear una actividad flexible (Corregido el endpoint y el token interno)
export const PostActividad = async (actividad) => {
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.post(
            `${API_URL}/planificador/actividades-flexibles`,
            actividad,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error creando actividad:', error);
        throw error;
    }
};

// 4. Actualizar una actividad flexible (Corregido el endpoint y el token interno)
export const PutActividad = async (actividad) => {
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.put(
            `${API_URL}/planificador/actividades-flexibles/${actividad.id}`,
            actividad,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error actualizando actividad:', error);
        throw error;
    }
};

// 5. Eliminar una actividad flexible (Corregido el endpoint y el token interno)
export const DeleteActividad = async (id) => {
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.delete(
            `${API_URL}/planificador/actividades-flexibles/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error eliminando actividad:', error);
        throw error;
    }
};


// import axios from 'axios';

// const API_URL =
//     `${import.meta.env.VITE_API_URL}`;

// const token = localStorage.getItem("token") || sessionStorage.getItem("token");


// export const getCursos = async () => {
//     try {
//         const cursados = await axios.get(
//             `${API_URL}/estado-materias`,
//             { headers: { Authorization: `Bearer ${token}` } }
//         );
        
//         // Esperar TODAS las promesas del segundo GET
//         const cursosDetalles = await Promise.all(
//             cursados.data.map(async (curso) => {
//                 const response = await axios.get(
//                     `${API_URL}/cursos/${curso.idCurso}`, 
//                     { headers: { Authorization: `Bearer ${token}` } }
//                 );
//                 return response.data;
//             })
//         );

//         return cursosDetalles;
        
//     } catch (error) {
//         console.error('Error obteniendo actividades:', error);
//         throw error;
//     }
// };

// // OBTENER LAS ACTIVIDADES FLEXIBLES (La que te estaba faltando)
// export const getActividadesFlexibles = async () => {
//     try {
//         const token = localStorage.getItem("token") || sessionStorage.getItem("token");
//         const respuesta = await axios.get(`${API_URL}/planificador/actividades-flexibles`, {
//             headers: { Authorization: `Bearer ${token}` }
//         });
//         return respuesta.data;
//     } catch (error) {
//         console.error("Error en getActividadesFlexibles:", error);
//         throw error;
//     }
// };

// export const PostActividad = async (
//     actividad
// ) => {

//     try {

//         const response = await axios.post(
//             API_URL,
//             actividad,
//             { headers: { Authorization: `Bearer ${token}` } }
//         );

//         return response.data;

//     } catch (error) {

//         console.error(
//             'Error creando actividad:',
//             error
//         );

//         throw error;
//     }
// };

// export const PutActividad = async (
//     actividad
// ) => {

//     try {

//         const response = await axios.put(
//             `${API_URL}/${actividad.id}`,
//             actividad,
//             { headers: { Authorization: `Bearer ${token}` } }
//         );

//         return response.data;

//     } catch (error) {

//         console.error(
//             'Error actualizando actividad:',
//             error
//         );

//         throw error;
//     }
// };

// export const DeleteActividad = async (
//     id
// ) => {

//     try {

//         const response = await axios.delete(
//             `${API_URL}/${id}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//         );

//         return response.data;

//     } catch (error) {

//         console.error(
//             'Error eliminando actividad:',
//             error
//         );

//         throw error;
//     }
// };