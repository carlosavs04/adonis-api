import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import Route from '@ioc:Adonis/Core/Route'
import Mail from '@ioc:Adonis/Addons/Mail'
import View from '@ioc:Adonis/Core/View'
import Database from '@ioc:Adonis/Lucid/Database'
const { Vonage } = require('@vonage/server-sdk')
const local = "http://127.0.0.1:3333"

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

        const confirmEmailUrl = local + Route.makeSignedUrl('email', { id: user.id }, { expiresIn: '15m' })
        const confirmPhoneUrl = local + Route.makeSignedUrl('sms', { id: user.id }, { expiresIn: '30m' })

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

    public async verifyEmail({ request, response, params }: HttpContextContract) {
        if (!request.hasValidSignature()) {
            response.abort('El enlace de confirmación ha expirado.', 401)
        }

        const user = await User.findOrFail(params.id)
        const randomNumber = Math.floor(Math.random() * 9000) + 1000

        user.codigo = randomNumber
        await user.save()
        this.sendSMS(randomNumber)

        return View.render('emails/sms')
    }

    public async sendSMS(codigo: number) {
        const vonage = new Vonage({
            apiKey: "e8c2bf36",
            apiSecret: "P9LRDR5wY8lbhIqy"
          })

        const from = "Escuela APIs"
        const to = "528713321257"
        const text = 'Tu código de verificación es: ' + codigo + '.'

        vonage.sms.send({to, from, text})
            .then(resp => { console.log('Message sent successfully'); console.log(resp); })
            .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
    }

    public async verifyPhone({ request, response, params }: HttpContextContract) {
        if (!request.hasValidSignature()) {
            response.abort('El enlace de confirmación ha expirado.', 401)
        }

        await request.validate({
            schema: schema.create({
                codigo: schema.number(),
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                number: 'El campo {{ field }} debe ser un número entero.',
            }
        })

        const user = await User.findOrFail(params.id)

        if (user.codigo === request.input('codigo')) {
            user.active = '1'
            await user.save()

            return response.ok({
                'status': 200,
                'mensaje': 'Cuenta verificada correctamente.',
                'error': [],
                'data': user,
            })
        } else {
            return response.badRequest({
                'status': 400,
                'mensaje': 'El código de verificación es incorrecto.',
                'error': [],
                'data': [],
            })
        }
    }

    public async login({ request, response, auth }: HttpContextContract) {
        await request.validate({
            schema: schema.create({
                email: schema.string([
                    rules.email(),
                    rules.trim(),
                ]),
                password: schema.string([
                    rules.minLength(8),
                    rules.maxLength(20),
                    rules.trim(),
                ]),
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                string: 'El campo {{ field }} debe ser una cadena de caracteres.',
                trim: 'El campo {{ field }} no debe contener espacios en blanco.',
                email: 'El campo {{ field }} debe ser un correo electrónico válido.',
                minLength: 'El campo {{ field }} debe tener un mínimo de {{ options.minLength }} caracteres.',
                maxLength: 'El campo {{ field }} debe tener un máximo de {{ options.maxLength }} caracteres.',
            }
        })

        const user = await User.query().where('email', request.input('email')).where('active', '1').first()

        if (!user) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'No existe ningún usuario con este correo o su cuenta está desactivada.',
                'error': [],
                'data': [],
            })
        }

        if(!await Hash.verify(user.password, request.input('password'))) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Credenciales de usuario incorrectas.',
                'error': [],
                'data': [],
            })
        }

        const token = await auth.use('api').generate(user)

        return response.ok({
            'status': 200,
            'mensaje': 'Sesión iniciada correctamente.',
            'error': [],
            'data': user,
            'token': token.token,
        })
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use('api').revoke()

        return response.ok({
            'status': 200,
            'mensaje': 'Sesión cerrada correctamente.',
            'error': [],
            'data': [],
        })
    }

    public async changeRol({ request, response, params }) {
        await request.validate({
            schema: schema.create({
                rol: schema.number(),
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                number: 'El campo {{ field }} debe ser un número entero.',
            }
        })

        const user = await User.find(params.id)

        if(!user) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'No existe ningún usuario con el id: ' + params.id + '.',
                'error': [],
                'data': [],
            })
        }

        if (user.rol_id === request.input('rol')) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'El usuario ya tiene asignado este rol.',
                'error': [],
                'data': [],
            })
        }

        user.rol_id = request.input('rol')
        await user.save()

        await Mail.send((message) => {
            message
                .from('escuela@api.com')
                .to(user.email)
                .subject('Tu rol ha cambiado')
                .htmlView('emails/rol', { rol: user.rol_id, name: user.name })
        })

        return response.ok({
            'status': 200,
            'mensaje': 'Rol cambiado exitosamente.',
            'error': [],
            'data': user,
        })
    }

    public async changeStatus({ response, params }) {
        const user = await User.find(params.id)

        if(!user) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'No existe ningún usuario con el id: ' + params.id + '.',
                'error': [],
                'data': [],
            })
        }

        if (user.active == '1') {
            user.active = '0'
            await user.save()

            await Mail.send((message) => {
                message
                    .from('escuela@api.com')
                    .to(user.email)
                    .subject('Tu cuenta ha sido desactivada')
                    .htmlView('emails/desactivate', { name: user.name })
            })

            return response.ok({
                'status': 200,
                'mensaje': 'Usuario desactivado exitosamente.',
                'error': [],
                'data': user,
            })
        } else if (user.active == '0') {
            user.active = '1'
            await user.save()

            await Mail.send((message) => {
                message
                    .from('escuela@api.com')
                    .to(user.email)
                    .subject('Tu cuenta ha sido reactivada')
                    .htmlView('emails/activate', { name: user.name })
            })

            return response.ok({
                'status': 200,
                'mensaje': 'Usuario activado exitosamente.',
                'error': [],
                'data': user,
            })
        }
    }

    public async allUsers() {
        const users = await Database
            .from('users')
            .join('roles', 'users.rol_id', 'roles.id')
            .select('users.*', 'roles.name as rol')

        return users
    }

    public async getUser({ params, response }) {
        const user = await User.find(params.id)

        if(!user) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'No existe ningún usuario con el id: ' + params.id + '.',
                'error': [],
                'data': [],
            })
        }

        return user
    }

    public async isAdmin({ auth }) {
        const user = await auth.use('api').authenticate()

        if (user.rol_id === 1) {
            return true
        } else {
            return false
        }
    }

    public async getRole({ auth, response }) {
        const user = await auth.use('api').authenticate()

        return response.ok({
            'rol': user.rol_id,
        })
    }

    public async getTokenUser({ auth, response }) {
        const user = await auth.use('api').authenticate()

        if(user.active === '1') {
            return response.ok({
                'data': user,
            })
        }
    }
}
