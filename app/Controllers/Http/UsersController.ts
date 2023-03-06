import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import Route from '@ioc:Adonis/Core/Route'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class UsersController {
    public async register ({ request, response }: HttpContextContract) {
        await request.validate({
            schema: schema.create({
                name: schema.string([
                    rules.maxLength(40),
                ]),
                ap_paterno: schema.string([
                    rules.maxLength(20),
                ]),
                ap_materno: schema.string([
                    rules.maxLength(20),
                ]),
                email: schema.string([
                    rules.email(),
                    rules.unique({ table: 'users', column: 'email' }),
                    rules.trim(),
                ]),
                password: schema.string([
                    rules.minLength(8),
                    rules.maxLength(20),
                    rules.trim(),
                ]),
                telefono: schema.string([
                    rules.maxLength(10),
                    rules.minLength(10),
                ]),
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                maxLength: 'El campo {{ field }} debe tener un máximo de {{ options.maxLength }} caracteres.',
                minLength: 'El campo {{ field }} debe tener un mínimo de {{ options.minLength }} caracteres.',
                email: 'El campo {{ field }} debe ser un correo electrónico válido.',
                unique: 'El campo {{ field }} ya está en uso.',
                string: 'El campo {{ field }} debe ser una cadena de caracteres.',
                trim: 'El campo {{ field }} no debe contener espacios en blanco.',
            }
        })

        const user = await User.create({
            name: request.input('name'),
            ap_paterno: request.input('ap_paterno'),
            ap_materno: request.input('ap_materno'),
            email: request.input('email'),
            password: await Hash.make(request.input('password')),
            telefono: request.input('telefono'),
        })

        const confirmEmailUrl = Route.makeSignedUrl('email', { id: user.id }, { expiresIn: '15m' })
        const confirmPhoneUrl = Route.makeSignedUrl('sms', { id: user.id }, { expiresIn: '30m' })

        await Mail.send((message) => {
            message 
                .from('escuela@api.com')
                .to(user.email)
                .subject('¡Bienvenido a la escuela!')
                .htmlView('emails/welcome', { url: confirmEmailUrl, name: user.name })
        })

        return response.created({
            'status': 201,
            'mensaje': 'Usuario registrado correctamente.',
            'error': [],
            'data': user,
            'url': confirmPhoneUrl,
        })
    }

    public async verifyEmail({ request, response }: HttpContextContract) {
        if (!request.hasValidSignature()) {
            response.abort('El enlace de confirmación ha expirado.', 401)
        }

        const user = await User.findOrFail(request.input('id'))
        const randomNumber = Math.floor(Math.random() * 9000) + 1000

        user.codigo = randomNumber
        await user.save()


    }
}
