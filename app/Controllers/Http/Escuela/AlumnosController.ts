import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Alumno from 'App/Models/Alumno'
import Carrera from 'App/Models/Carrera'

export default class AlumnosController {
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
                edad: schema.number(),
                carrera_id: schema.number(),
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                maxLength: 'El campo {{ field }} debe tener un máximo de {{ options.maxLength }} caracteres.',
                number: 'El campo {{ field }} debe ser un número entero.',
                string: 'El campo {{ field }} debe ser una cadena de caracteres.',
            } 
        })

        const carrera = await Carrera.find(request.input('carrera_id'))

        if (!carrera) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron almacenados correctamente.',
                'error': 'No existe una carrera con este id: ' + request.input('carrera_id') + '.',
                'data': [],
            })
        }

        const alumno = await Alumno.create({
            nombre: request.input('nombre'),
            ap_paterno: request.input('ap_paterno'),
            ap_materno: request.input('ap_materno'),
            edad: request.input('edad'),
            carrera_id: request.input('carrera_id'),
        })

        return response.created({
            'status': 201,
            'mensaje': 'Los datos fueron almacenados correctamente.',
            'error': [],
            'data': alumno,
        })
    }

    public async allAlumnos() {
        const alumnos = await Database
            .from('alumnos')
            .join('carreras', 'alumnos.carrera_id', 'carreras.id')
            .select('alumnos.*', 'carreras.nombre as carrera')

        return alumnos
    }

    public async filterAlumnos({ params }: HttpContextContract) {
        const alumnos = await Database
            .from('alumnos')
            .join('carreras', 'alumnos.carrera_id', 'carreras.id')
            .select('alumnos.*', 'carreras.nombre as carrera')
            .where('carrera_id', params.id)

        return alumnos
    }

    public async getAlumno({ params, response }: HttpContextContract) {
        const alumno = await Alumno.find(params.id)

        if(!alumno) {
            return response.notFound({
                'status': 404,
                'mensaje': 'No fue posible encontrar ningún dato.',
                'error': 'No existe un alumno con este id: ' + params.id + '.',
                'data': [],
            })
        }

        return alumno
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
                edad: schema.number(),
                carrera_id: schema.number(),
            }),
            messages: {
                required: 'El campo {{ field }} es obligatorio.',
                maxLength: 'El campo {{ field }} debe tener un máximo de {{ options.maxLength }} caracteres.',
                number: 'El campo {{ field }} debe ser un número entero.',
                string: 'El campo {{ field }} debe ser una cadena de caracteres.',
            } 
        })

        const alumno = await Alumno.find(params.id)
        const carrera = await Carrera.find(request.input('carrera_id'))

        if (!alumno) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron actualizados correctamente.',
                'error': 'No existe un alumno con este id: ' + params.id + '.',
                'data': [],
            })
        }

        if (!carrera) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron actualizados correctamente.',
                'error': 'No existe una carrera con este id: ' + request.input('carrera_id') + '.',
                'data': [],
            })
        }

        alumno.nombre = request.input('nombre')
        alumno.ap_paterno = request.input('ap_paterno')
        alumno.ap_materno = request.input('ap_materno')
        alumno.edad = request.input('edad')
        alumno.carrera_id = request.input('carrera_id')

        await alumno.save()

        return response.ok({
            'status': 200,
            'mensaje': 'Los datos fueron actualizados correctamente.',
            'error': [],
            'data': alumno,
        })
    }

    public async delete({ params, response }: HttpContextContract) {
        const alumno = await Alumno.find(params.id)

        if (!alumno) {
            return response.badRequest({
                'status': 400,
                'mensaje': 'Los datos no fueron eliminados.',
                'error': 'No existe un alumno con este id: ' + params.id + '.',
                'data': [],
            })
        }

        await alumno.delete()

        return response.ok({
            'status': 200,
            'mensaje': 'Los datos fueron eliminados correctamente.',
            'error': [],
            'data': [],
        })
    }
}
