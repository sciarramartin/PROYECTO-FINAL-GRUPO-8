const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { EncuestaCatedra, Materia, Curso, Usuario, Perfil } = require('../modelos/asociaciones');

// POST /api/encuestas-catedra - Registrar una nueva encuesta de cátedra
router.post('/', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_materia, id_curso, dificultad, claridad_docente, disponibilidad, es_anonima, comentario } = req.body;

        if (!id_materia || !dificultad || !claridad_docente || !disponibilidad) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para la encuesta (materia y calificaciones de 1 a 5).' });
        }

        // Validar rango de 1 a 5
        const difNum = Number(dificultad);
        const claNum = Number(claridad_docente);
        const dispNum = Number(disponibilidad);

        if ([difNum, claNum, dispNum].some(val => isNaN(val) || val < 1 || val > 5)) {
            return res.status(400).json({ error: 'Las valoraciones deben ser números enteros entre 1 y 5.' });
        }

        // Buscar si ya existía una encuesta previa de este usuario para esta materia
        let encuesta = await EncuestaCatedra.findOne({
            where: { id_usuario, id_materia }
        });

        if (encuesta) {
            encuesta.id_curso = id_curso || encuesta.id_curso;
            encuesta.dificultad = difNum;
            encuesta.claridad_docente = claNum;
            encuesta.disponibilidad = dispNum;
            encuesta.es_anonima = !!es_anonima;
            encuesta.comentario = comentario ? comentario.trim() : null;
            await encuesta.save();
        } else {
            encuesta = await EncuestaCatedra.create({
                id_usuario,
                id_materia,
                id_curso: id_curso || null,
                dificultad: difNum,
                claridad_docente: claNum,
                disponibilidad: dispNum,
                es_anonima: !!es_anonima,
                comentario: comentario ? comentario.trim() : null
            });
        }

        res.status(201).json({
            mensaje: 'Encuesta de cátedra registrada exitosamente.',
            encuesta
        });
    } catch (error) {
        console.error('Error al registrar encuesta de cátedra:', error);
        res.status(500).json({ error: 'Error interno del servidor al registrar la encuesta.' });
    }
});

// GET /api/encuestas-catedra/materia/:materiaId - Estadísticas y reseñas de una materia
router.get('/materia/:materiaId', verificarToken, async (req, res) => {
    try {
        const { materiaId } = req.params;

        const encuestas = await EncuestaCatedra.findAll({
            where: { id_materia: materiaId },
            include: [
                {
                    model: Usuario,
                    as: 'Estudiante',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'],
                    include: [
                        {
                            model: Perfil,
                            attributes: ['foto_perfil']
                        }
                    ]
                },
                {
                    model: Curso,
                    as: 'Curso',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const total = encuestas.length;
        if (total === 0) {
            return res.json({
                total: 0,
                promedios: {
                    dificultad: 0,
                    claridad_docente: 0,
                    disponibilidad: 0,
                    general: 0
                },
                encuestas: []
            });
        }

        const sumDif = encuestas.reduce((acc, curr) => acc + curr.dificultad, 0);
        const sumCla = encuestas.reduce((acc, curr) => acc + curr.claridad_docente, 0);
        const sumDisp = encuestas.reduce((acc, curr) => acc + curr.disponibilidad, 0);

        const promedios = {
            dificultad: Number((sumDif / total).toFixed(1)),
            claridad_docente: Number((sumCla / total).toFixed(1)),
            disponibilidad: Number((sumDisp / total).toFixed(1)),
            general: Number(((sumCla + sumDisp + (6 - sumDif)) / (total * 3)).toFixed(1))
        };

        // Formatear encuestas respetando anonimato
        const encuestasFormateadas = encuestas.map(e => {
            const anonimo = e.es_anonima;
            return {
                id: e.id,
                dificultad: e.dificultad,
                claridad_docente: e.claridad_docente,
                disponibilidad: e.disponibilidad,
                comentario: e.comentario,
                createdAt: e.createdAt,
                curso: e.Curso ? e.Curso.nombre : 'General',
                autor: anonimo ? {
                    nombre: 'Estudiante Anónimo',
                    foto_perfil: null,
                    nombre_usuario: null
                } : {
                    nombre: `${e.Estudiante?.nombre || ''} ${e.Estudiante?.apellido || ''}`.trim(),
                    foto_perfil: e.Estudiante?.Perfil?.foto_perfil || null,
                    nombre_usuario: e.Estudiante?.nombre_usuario || ''
                }
            };
        });

        res.json({
            total,
            promedios,
            encuestas: encuestasFormateadas
        });
    } catch (error) {
        console.error('Error al obtener encuestas de materia:', error);
        res.status(500).json({ error: 'Error al obtener encuestas de la materia.' });
    }
});

// GET /api/encuestas-catedra/mis-encuestas - Consultar si el alumno ya calificó materias
router.get('/mis-encuestas', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const encuestas = await EncuestaCatedra.findAll({
            where: { id_usuario },
            attributes: ['id', 'id_materia', 'id_curso', 'dificultad', 'claridad_docente', 'disponibilidad', 'createdAt']
        });
        res.json(encuestas);
    } catch (error) {
        console.error('Error al obtener mis encuestas:', error);
        res.status(500).json({ error: 'Error al obtener tus encuestas.' });
    }
});

module.exports = router;
