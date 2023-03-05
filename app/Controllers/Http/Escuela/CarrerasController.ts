import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Carrera from 'App/Models/Carrera'

export default class CarrerasController {
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

        const carrera = await Carrera.create({
            nombre: request.input('nombre'),
        })

        return response.created({
            'status': 201,
            'mensaje': 'Los datos fueron almacenados correctamente.',
            'error': [],
            'data': carrera,
        })
    }

    public async allCarreras() {
        const carreras = await Carrera.query().select('*')
        return carreras
    }

    public async getCarrera({ params, response }: HttpContextContract) {
        const carrera = await Carrera.find(params.id)

        if(!carrera) {
            return response.notFound({
                'status': 404,
                'mensaje': 'No fue posible encontrar ningún dato.',
                'error': 'No existe una carrera con este id: ' + params.id + '.',
                'data': [],
            })
        }

        return carrera
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

        const carrera = await Carrera.find(params.id)

        if (!carrera) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron actualizados correctamente.',
                'error': 'No existe una carrera con este id: ' + params.id + '.',
                'data': [],
            })
        }

        carrera.nombre = request.input('nombre')
        await carrera.save()

        return response.ok({
            'status': 200,
            'mensaje': 'Los datos fueron actualizados correctamente.',
            'error': [],
            'data': carrera,
        })
    }

    public async delete({ params, response }: HttpContextContract) {
        const carrera = await Carrera.find(params.id)

        if (!carrera) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron eliminados.',
                'error': 'No existe una carrera con este id: ' + params.id + '.',
                'data': [],
            })
        }

        await carrera.delete()

        return response.ok({
            'status': 200,
            'mensaje': 'Los datos fueron eliminados correctamente.',
            'error': [],
            'data': [],
        })
    }
}
