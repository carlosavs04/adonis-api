import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Profesor from 'App/Models/Profesor'

export default class ProfesoresController {
    public async create({ request, response }: HttpContextContract) {
        await request.validate({
            schema: schema.create({
                nombre: schema.string([
                    rules.maxLength(40),
                ]),
                ap_paterno: schema.string([
                    rules.maxLength(20),
                ]),
                ap_materno: schema.string([
                    rules.maxLength(20),
                ]),
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                maxLength: 'El campo {{ field }} debe tener un máximo de {{ options.maxLength }} caracteres.',
                string: 'El campo {{ field }} debe ser una cadena de caracteres.',
            }
        })

        const profesor = await Profesor.create({
            nombre: request.input('nombre'),
            ap_paterno: request.input('ap_paterno'),
            ap_materno: request.input('ap_materno'),
        })

        return response.created({
            'status': 201,
            'mensaje': 'Los datos fueron almacenados correctamente.',
            'error': [],
            'data': profesor,
        })
    }   

    public async allProfesores() {
        const profesores = await Profesor.query().select('*')
        return profesores
    }

    public async filterProfesores({ params }: HttpContextContract) {
        const profesores = await Database
            .from('profesores')
            .join('materia_profesor', 'profesores.id', 'materia_profesor.profesor_id')
            .join('materias', 'materia_profesor.materia_id', 'materias.id')
            .select('profesores.*', 'materias.nombre as materiaStr')
            .where('materias.id', params.id)

        return profesores
    }

    public async getProfesor({ params, response }: HttpContextContract) {
        const profesor = await Profesor.find(params.id)

        if(!profesor) {
            return response.notFound({
                'status': 404,
                'mensaje': 'No fue posible encontrar ningún dato.',
                'error': 'No existe un profesor con este id: ' + params.id + '.',
                'data': [],
            })
        }

        return profesor
    }

    public async update({ request, response, params }: HttpContextContract) {
        await request.validate({
            schema: schema.create({
                nombre: schema.string([
                    rules.maxLength(40),
                ]),
                ap_paterno: schema.string([
                    rules.maxLength(20),
                ]),
                ap_materno: schema.string([
                    rules.maxLength(20),
                ]),
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                maxLength: 'El campo {{ field }} debe tener un máximo de {{ options.maxLength }} caracteres.',
                string: 'El campo {{ field }} debe ser una cadena de caracteres.',
            }
        })

        const profesor = await Profesor.find(params.id)

        if(!profesor) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron actualizados correctamente.',
                'error': 'No existe un profesor con este id: ' + params.id + '.',
                'data': [],
            })
        }

        profesor.nombre = request.input('nombre')
        profesor.ap_paterno = request.input('ap_paterno')
        profesor.ap_materno = request.input('ap_materno')

        await profesor.save()

        return response.ok({
            'status': 200,
            'mensaje': 'Los datos fueron actualizados correctamente.',
            'error': [],
            'data': profesor,
        })
    }

    public async delete({ params, response }: HttpContextContract) {
        const profesor = await Profesor.find(params.id)

        if(!profesor) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron eliminados.',
                'error': 'No existe un profesor con este id: ' + params.id + '.',
                'data': [],
            })
        }

        await profesor.delete()

        return response.ok({
            'status': 200,
            'mensaje': 'Los datos fueron eliminados correctamente.',
            'error': [],
            'data': [],
        })
    }

}

