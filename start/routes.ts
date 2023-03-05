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
  
  Route.group(() => {
    Route.group(() => {
      Route.post('/alumno', 'Escuela/AlumnosController.create')
    })
  
    Route.group(() => {
      Route.get('/alumnos', 'Escuela/AlumnosController.allAlumnos')
      Route.get('/alumnos/:id', 'Escuela/AlumnosController.filterAlumnos').where('id', /^[0-9]+$/)
      Route.get('/carreras', 'Escuela/CarrerasController.allCarreras')
      Route.get('/materias', 'Escuela/MateriasController.allMaterias')
      Route.get('/profesores', 'Escuela/ProfesoresController.allProfesores')
      Route.get('/profesores/:id', 'Escuela/ProfesoresController.filterProfesores').where('id', /^[0-9]+$/)
    })
  
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
    })
  })
}).prefix('/api/v1/escuela')
