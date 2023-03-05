import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Materia from 'App/Models/Materia'

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
        const materias = await Materia.query().select('*')
        return materias
    }

    public async getMateria({ params, response }: HttpContextContract) {
        const materia = await Materia.find(params.id)

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
}
