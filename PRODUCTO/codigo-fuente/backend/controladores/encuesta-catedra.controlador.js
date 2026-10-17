const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { EncuestaCatedra, Materia, Curso, Usuario, Perfil } = require('../modelos/asociaciones');

// POST /api/encuestas-catedra - Registrar una nueva encuesta de cátedra
router.post('/', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_materia, id_curso, dificultad, claridad_docente, disponibilidad, es_anonima, comentario, estado_academico } = req.body;

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
            encuesta.estado_academico = estado_academico || 'Regular';
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
                comentario: comentario ? comentario.trim() : null,
                estado_academico: estado_academico || 'Regular'
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

        let sumDif = 0;
        let sumCla = 0;
        let sumDisp = 0;
        let sumaPromediosIndividuales = 0;

        encuestas.forEach(enc => {
            const data = enc.get ? enc.get({ plain: true }) : enc;
            const dif = Number(data.dificultad) || 0;
            const cla = Number(data.claridad_docente) || 0;
            const disp = Number(data.disponibilidad) || 0;

            sumDif += dif;
            sumCla += cla;
            sumDisp += disp;

            // Promedio exacto de esta reseña en particular
            sumaPromediosIndividuales += (dif + cla + disp) / 3;
        });

        const promedios = {
            dificultad: Number((sumDif / total).toFixed(1)),
            claridad_docente: Number((sumCla / total).toFixed(1)),
            disponibilidad: Number((sumDisp / total).toFixed(1)),
            // 🟢 Promedio general real en escala de 1 a 5 estrellas
            general: Number((sumaPromediosIndividuales / total).toFixed(1))
        };

        // Formatear encuestas respetando anonimato
        const encuestasFormateadas = encuestas.map(e => {
            const data = e.get ? e.get({ plain: true }) : e;
            const esAnonima = Boolean(data.es_anonima);
            const estudiante = data.Estudiante || {};
            const perfil = estudiante.Perfil || estudiante.perfil || {};

            return {
                id: data.id,
                dificultad: data.dificultad,
                claridad_docente: data.claridad_docente,
                disponibilidad: data.disponibilidad,
                comentario: data.comentario,
                estado_academico: data.estado_academico,
                es_anonima: esAnonima,
                createdAt: data.createdAt,
                curso: data.Curso ? data.Curso.nombre : 'General',
                autor: esAnonima ? {
                    nombre: 'Estudiante Anónimo',
                    foto_perfil: null,
                    nombre_usuario: null
                } : {
                    nombre: `${estudiante.nombre || ''} ${estudiante.apellido || ''}`.trim() || 'Estudiante',
                    foto_perfil: perfil.foto_perfil || null,
                    nombre_usuario: estudiante.nombre_usuario || ''
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