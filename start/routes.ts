/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'UsersController.register')
  Route.get('verify/email/:id', 'UsersController.verifyEmail').as('email')
  Route.post('verify/phone/:id', 'UsersController.verifyPhone').as('sms')
  Route.post('/login', 'UsersController.login')
  Route.get('/works', 'UsersController.runWorks')

  Route.group(() => {
    Route.group(() => {
      Route.post('/alumno', 'Escuela/AlumnosController.create')
    }).middleware('role:1,3')

    Route.group(() => {
      Route.get('/logout', 'UsersController.logout')
      Route.get('/alumnos', 'Escuela/AlumnosController.allAlumnos')
      Route.get('/alumnos/:id', 'Escuela/AlumnosController.filterAlumnos').where('id', /^[0-9]+$/)
      Route.get('/carreras', 'Escuela/CarrerasController.allCarreras')
      Route.get('/materias', 'Escuela/MateriasController.allMaterias')
      Route.get('/profesores', 'Escuela/ProfesoresController.allProfesores')
      Route.get('/profesores/:id', 'Escuela/ProfesoresController.filterProfesores').where('id', /^[0-9]+$/)
      Route.get('/user/role', 'UsersController.getRole')
      Route.get('/user', 'UsersController.getTokenUser')
      Route.get('/user/admin', 'UsersController.isAdmin')
    }).middleware('role:1,2,3')

    Route.group(() => {
      Route.get('/alumno/:id', 'Escuela/AlumnosController.getAlumno').where('id', /^[0-9]+$/)
      Route.put('/alumno/:id', 'Escuela/AlumnosController.update').where('id', /^[0-9]+$/)
      Route.delete('/delete/alumno/:id', 'Escuela/AlumnosController.delete').where('id', /^[0-9]+$/)
      Route.post('/carrera', 'Escuela/CarrerasController.create')
      Route.get('/carrera/:id', 'Escuela/CarrerasController.getCarrera').where('id', /^[0-9]+$/)
      Route.put('/carrera/:id', 'Escuela/CarrerasController.update').where('id', /^[0-9]+$/)
      Route.delete('/delete/carrera/:id', 'Escuela/CarrerasController.delete').where('id', /^[0-9]+$/)
      Route.post('/materia', 'Escuela/MateriasController.create')
      Route.get('/materia/:id', 'Escuela/MateriasController.getMateria').where('id', /^[0-9]+$/)
      Route.put('/materia/:id', 'Escuela/MateriasController.update').where('id', /^[0-9]+$/)
      Route.delete('/delete/materia/:id', 'Escuela/MateriasController.delete').where('id', /^[0-9]+$/)
      Route.post('/profesor', 'Escuela/ProfesoresController.create')
      Route.get('/profesor/:id', 'Escuela/ProfesoresController.getProfesor').where('id', /^[0-9]+$/)
      Route.put('/profesor/:id', 'Escuela/ProfesoresController.update').where('id', /^[0-9]+$/)
      Route.delete('/delete/profesor/:id', 'Escuela/ProfesoresController.delete').where('id', /^[0-9]+$/)
      Route.post('/materia/add/profesor/:id', 'Escuela/MateriasController.addProfesor').where('id', /^[0-9]+$/)
      Route.post('/delete/materia/profesor/:id', 'Escuela/MateriasController.removeProfesor').where('id', /^[0-9]+$/)
      Route.post('/profesor/add/materia/:id', 'Escuela/ProfesoresController.addMateria').where('id', /^[0-9]+$/)
      Route.post('/delete/profesor/materia/:id', 'Escuela/ProfesoresController.removeMateria').where('id', /^[0-9]+$/)
      Route.get('/roles', 'RolesController.getRoles')
      Route.put('/rol/usuario/:id', 'UsersController.changeRol').where('id', /^[0-9]+$/)
      Route.put('/usuario/active/:id', 'UsersController.changeStatus').where('id', /^[0-9]+$/)
      Route.get('/users', 'UsersController.allUsers')
      Route.get('/user/:id', 'UsersController.getUser').where('id', /^[0-9]+$/)
    }).middleware('role:1')
  }).middleware(['auth', 'active'])
}).prefix('api/v1/escuela')

Route.group(() => {
  Route.post('/animal', 'AnimalesController.create')
  Route.get('/animales', 'AnimalesController.allAnimales')
}).prefix('api/v1/animales')
