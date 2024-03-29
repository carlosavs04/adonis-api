import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Role {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>, ...roles: string[]) {
    const user = await auth.use('api').authenticate()
    const rolesArray = roles.join(',').split(',')

    for(const role of rolesArray) {
      if(user.rol_id === Number(role)) {
        await next()
        return
      }
    }

    return response.unauthorized('No tienes permisos para realizar esta acción.')
  }
}
