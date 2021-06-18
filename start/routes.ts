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

Route.get('/', 'Api/HomeController.index')

Route.post('/api/oauth', 'Api/AuthController.login')
Route.get('/api/oauth', 'Api/AuthController.boot')

Route.post('/api/users', 'Api/UsersController.create')
Route.get('/api/users', 'Api/UsersController.index')
Route.post('/api/users/:id', 'Api/UsersController.update')

Route.post('/api/personsinfos', 'Api/PersonsInfosController.create')

Route.get('/api/clients/:id', 'Api/ClientsController.show')
Route.get('/api/clients/:id/entries', 'Api/ClientsController.showEntries')
Route.get('/api/clients', 'Api/ClientsController.index')

Route.get('/api/filesystem', 'Api/FileSystemsController.show')

Route.post('/api/robots/bradesco-inss/:clientId', 'Api/Robots/BradescoInssController.index')
Route.get('/api/robots/entries', 'Api/Robots/RobotManagerController.index')
