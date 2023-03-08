import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import Route from '@ioc:Adonis/Core/Route'
import Mail from '@ioc:Adonis/Addons/Mail'
import View from '@ioc:Adonis/Core/View'
import Database from '@ioc:Adonis/Lucid/Database'
import { Queue, Worker, Job } from 'bullmq'

const { Vonage } = require('@vonage/server-sdk')
const local = "http://127.0.0.1:3333"
const welcomeMailQueue = new Queue('welcome')
const smsQueue = new Queue('sms')
const roleMailQueue = new Queue('role')
const desactivateMailQueue = new Queue('desactivate')
const activateMailQueue = new Queue('activate')


const welcomeWorker = new Worker('welcome', async (job: Job) => {
    const url = job.data.url
    const name = job.data.name
    const email = job.data.email

    await Mail.send((message) => {
        message
            .from('escuela@api.com')
            .to(email)
            .subject('¡Bienvenido a la escuela!')
            .htmlView('emails/welcome', { name: name, url: url })
    })
}, { autorun: false })

welcomeWorker.on('error', (error) => {
    console.log(error)
})

const smsWorker = new Worker('sms', async (job: Job) => {
    const  code  = job.data.code
    const vonage = new Vonage({
        apiKey: "e8c2bf36",
        apiSecret: "P9LRDR5wY8lbhIqy"
      })

    const from = "Escuela APIs"
    const to = "528713321257"
    const text = 'Tu código de verificación es: ' + code + '.'

    vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
   
}, { autorun: false })

smsWorker.on('error', (error) => {
    console.log(error)
})

const roleWorker = new Worker('role', async (job: Job) => {
    const { email, name, rol } = job.data

    await Mail.send((message) => {
        message
            .from('escuela@api.com')
            .to(email)
            .subject('Tu rol ha cambiado')
            .htmlView('emails/rol', { rol: rol, name: name })
    })
}, { autorun: false })

roleWorker.on('error', (error) => {
    console.log(error)
})

const desactivateWorker = new Worker('desactivate', async (job: Job) => {
    const { email, name } = job.data

    await Mail.send((message) => {
        message
            .from('escuela@api.com')
            .to(email)
            .subject('Tu cuenta ha sido desactivada')
            .htmlView('emails/desactivate', { name: name })
    })
}, { autorun: false })

desactivateWorker.on('error', (error) => {
    console.log(error)
})  

const activateWorker = new Worker('activate', async (job: Job) => {
    const { email, name } = job.data
    await Mail.send((message) => {
        message
            .from('escuela@api.com')
            .to(email)
            .subject('Tu cuenta ha sido reactivada')
            .htmlView('emails/activate', { name: name })
    })
}, { autorun: false })

activateWorker.on('error', (error) => {
    console.log(error)
})

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

        await welcomeMailQueue.add('welcome', { url: confirmEmailUrl, name: user.name, email: user.email }, { delay: 15000 })

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

        await smsQueue.add('sms', { code: randomNumber }, { delay: 15000 })

        user.codigo = randomNumber
        await user.save()

        return View.render('emails/sms')
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

        if (user.codigo === Number(request.input('codigo'))) {
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
        roleMailQueue.add('role', { rol: user.rol_id, name: user.name, email: user.email }, { delay: 15000 })

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

            desactivateMailQueue.add('desactivate', { name: user.name, email: user.email }, { delay: 15000 })

            return response.ok({
                'status': 200,
                'mensaje': 'Usuario desactivado exitosamente.',
                'error': [],
                'data': user,
            })
        } else if (user.active == '0') {
            user.active = '1'
            await user.save()

            activateMailQueue.add('activate', { name: user.name, email: user.email }, { delay: 15000 })

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

    public async runWorks() {
        welcomeWorker.run()
        smsWorker.run()
        roleWorker.run()
        activateWorker.run()
        desactivateWorker.run()
    }
}
