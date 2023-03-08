import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class extends BaseSeeder {
  public async run () {
    await User.createMany([
      {
        name: 'Luis Angel',
        ap_paterno: 'Zapata',
        ap_materno: 'Zuñiga',
        email: 'luiszapata0815@gmail.com',
        telefono: '8713530073',
        password: await Hash.make('Luis200315'),
        active: '1',
        rol_id: 1,
      },
      {
        name: 'Carlos',
        ap_paterno: 'Avalos',
        ap_materno: 'Soto',
        email: 'carlos.avalos0409@outlook.com',
        telefono: '8713321257',
        password: await Hash.make('Prueba11'),
        active: '1',
        rol_id: 1,
      }
    ])
  }
}
