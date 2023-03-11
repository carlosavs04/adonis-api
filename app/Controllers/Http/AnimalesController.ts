import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Animal from 'App/Models/Animal'

export default class AnimalesController {
    public async create({ request, response }: HttpContextContract) {
        await request.validate({
            schema: schema.create({
                nombre: schema.string([
                    rules.maxLength(20),
                ]),
                tipo: schema.string([
                    rules.maxLength(20),
                ]),
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                maxLength: 'El campo {{ field }} debe tener un máximo de {{ options.maxLength }} caracteres.',
                string: 'El campo {{ field }} debe ser una cadena de caracteres.',
            }
        })

        const animal = await Animal.create({
            nombre: request.input('nombre'),
            tipo: request.input('tipo'),
        })

        return response.created({
            'status': 201,
            'mensaje': 'Los datos fueron almacenados correctamente.',
            'error': [],
            'data': animal,
        })
    }

    public async allAnimales() {
        const animales = Animal.query().select('*')
        
        return animales
    }
}
