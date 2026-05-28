import React, { useState, useEffect } from 'react';
import { getCursos } from './services';
import { PostActividad } from '../Us-8-Actividades-Personales/services';
import Horario from  '../Us-8-Actividades-Personales/Horario';

const Planificador = () => {
    const [refresh, setRefresh] = useState(0);
    const [cursados, setCursados] = useState([]);
    
    const cargarYPostear = async () => {
        try {
            const data = await getCursos();
            setCursados(data);
            console.log(data);
            // ✅ Ejecutar todas las promesas en paralelo
            const promesas = data.map((curso) => {
                const nuevaActividad = {
                    nombre: curso.nombre,
                    horaInicio: curso.horaInicio,
                    duracion: curso.duracion,
                    dias: curso.dias,
                };
                return PostActividad(nuevaActividad);
            });
            
            await Promise.all(promesas);
            setRefresh(r => r + 1);
            console.log('Todas las actividades fueron creadas');

            
        } catch (error) {
            console.error(error);
        }
    };
    
    
    return (
        <div className="px-4 py-2 flex flex-col gap-2">
            <Horario refresh={refresh}/>
            <button
                key={1}
                type="button"
                onClick={() => cargarYPostear()}
                className={`gap-5 w-27 h-12 rounded-lg text-xs font-semibold transition cursor-pointer bg-indigo-500 text-white shadow-sm`}
                title={"cargar materias"}
            >
                cargar materias
            </button>
        </div>
    );
}

export default Planificador;