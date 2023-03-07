import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Materia from 'App/Models/Materia'
import Profesor from 'App/Models/Profesor'

export default class MateriasController {
    public async create({ request, response }: HttpContextContract) {
        await request.validate({
            schema: schema.create({
                nombre: schema.string([
                    rules.maxLength(40),
                ])
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                maxLength: 'El campo {{ field }} debe tener un máximo de {{ options.maxLength }} caracteres.',
                string: 'El campo {{ field }} debe ser una cadena de caracteres.',
            }
        })

        const materia = await Materia.create({
            nombre: request.input('nombre'),
        })

        return response.created({
            'status': 201,
            'mensaje': 'Los datos fueron almacenados correctamente.',
            'error': [],
            'data': materia,
        })
    }

    public async allMaterias() {
        const materias = await Materia.query().select('*').preload('profesores')
        return materias
    }

    public async getMateria({ params, response }: HttpContextContract) {
        const materia = await Materia.query().select('*').preload('profesores').where('id', params.id).first()

        if(!materia) {
            return response.notFound({
                'status': 404,
                'mensaje': 'No fue posible encontrar ningún dato.',
                'error': 'No existe una materia con este id: ' + params.id + '.',
                'data': [],
            })
        }

        return materia
    }

    public async update({ request, response, params }: HttpContextContract) {
        await request.validate({
            schema: schema.create({
                nombre: schema.string([
                    rules.maxLength(40),
                ])
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                maxLength: 'El campo {{ field }} debe tener un máximo de {{ options.maxLength }} caracteres.',
                string: 'El campo {{ field }} debe ser una cadena de caracteres.',
            }
        })

        const materia = await Materia.find(params.id)

        if(!materia) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron actualizados correctamente.',
                'error': 'No existe una materia con este id: ' + params.id + '.',
                'data': [],
            })
        }

        materia.nombre = request.input('nombre')
        await materia.save()

        return response.ok({
            'status': 200,
            'mensaje': 'Los datos fueron actualizados correctamente.',
            'error': [],
            'data': materia,
        })
    }

    public async delete({ params, response }: HttpContextContract) {
        const materia = await Materia.find(params.id)

        if(!materia) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron eliminados.',
                'error': 'No existe una materia con este id: ' + params.id + '.',
                'data': [],
            })
        }

        await materia.delete()

        return response.ok({
            'status': 200,
            'mensaje': 'Los datos fueron eliminados correctamente.',
            'error': [],
            'data': [],
        })
    }

    public async addProfesor({ request, response, params }: HttpContextContract) {
        await request.validate({
            schema: schema.create({
                profesor_id: schema.number([
                    rules.exists({ table: 'profesores', column: 'id' }),
                ])
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                exists: 'El campo {{ field }} no existe en la tabla profesores.',
                number: 'El campo {{ field }} debe ser un número entero.',
            }
        })

        const materia = await Materia.find(params.id)
        const profesor = await Profesor.find(request.input('profesor_id'))

        if(!materia) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron agregados.',
                'error': 'No existe una materia con este id: ' + params.id + '.',
                'data': [],
            })
        }

        if(!profesor) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron agregados.',
                'error': 'No existe un profesor con este id: ' + request.input('profesor_id') + '.',
                'data': [],
            })
        }

        const profesores = await materia.related('profesores').query()

        if (profesores.some((profesor) => profesor.id === request.input('profesor_id'))) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron agregados.',
                'error': 'La materia ya tiene asignado este profesor.',
                'data': [],
            })
        } else {
            await materia.related('profesores').attach([profesor.id])

            return response.ok({
                'status': 200,
                'mensaje': 'Los datos fueron agregados correctamente.',
                'error': [],
                'data': materia,
            })
        }
    }

    public async removeProfesor({ request, response, params }: HttpContextContract) {
        const materia = await Materia.find(params.id)
        const profesoresId = request.input('profesor')

        if(!materia) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron eliminados.',
                'error': 'No existe una materia con este id: ' + params.id + '.',
                'data': [],
            })
        }

        for(const profesorId of profesoresId) {
            const profesor = await Profesor.find(profesorId)

            if(!profesor) {
                return response.badRequest({
                    'status': 400,
                    'mensaje': 'Los datos no fueron eliminados.',
                    'error': 'No existe un profesor con este id: ' + profesorId + '.',
                    'data': [],
                })
            }
            
            await materia.related('profesores').detach([profesor.id])
        }

        return response.ok({
            'status': 200,
            'mensaje': 'Los datos fueron eliminados correctamente.',
            'error': [],
            'data': materia,
        })
    }
}
