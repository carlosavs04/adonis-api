// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'

export default class RolesController {
    public async getRoles() {
        const roles = await Role.query().select('*')

        return roles
    }
}
