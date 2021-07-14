import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'Api/HomeController.index')

// Auth
Route.post('/api/oauth', 'Api/AuthController.login')

Route.group(() => {
  Route.get('/api/oauth', 'Api/AuthController.boot')

  // Users
  Route.post('/api/users', 'Api/UsersController.create')
  Route.get('/api/users', 'Api/UsersController.index')
  Route.post('/api/users/:id', 'Api/UsersController.update')

  // Tags
  Route.get('/api/tags', 'Api/TagsController.index')
  Route.post('/api/tags', 'Api/TagsController.create')

  // Person Infos
  Route.post('/api/personsinfos', 'Api/PersonsInfosController.create')

  // Systems
  Route.get('/api/systems', 'Api/SystemsController.index')
  Route.post('/api/systems', 'Api/SystemsController.create')
  Route.put('/api/systems/:id', 'Api/SystemsController.update')
  Route.post('/api/systems/:id/:field', 'Api/SystemsController.uploadFile')

  // Imports
  Route.post('/api/imports/:type', 'ClientsData/ImportsController.upload')
  Route.post('/api/imports/execute/:tableImportId', 'ClientsData/ImportsController.import')

  // Exports
  Route.get('/api/exports', 'ClientsData/ExportsController.index')
  Route.get('/api/exports/rows', 'ClientsData/ExportsController.getRows')
  Route.put('/api/exports/rows', 'ClientsData/ExportsController.updateRows')
  Route.post('/api/exports/:id/spreadsheets', 'ClientsData/ExportsController.syncGoogleSheets')
  Route.post('/api/exports/rows/logs', 'ClientsData/Rows/TableExportRowsController.createLog')

  // Partner Input Data
  Route.post('/api/partner/input-data/:systemId', 'Partner/PartnerInputDataController.create')

  // [Exports] Sync Spreadsheets
  Route.post(
    '/api/exports/:tableExportId/spreadsheets/rows',
    'ClientsData/Rows/TableExportRowsController.syncAllRowsExcel'
  )
  Route.post(
    '/api/exports/:id/spreadsheets/regenerate',
    'ClientsData/ExportsController.syncAndRegenerateGoogleSheets'
  )
  Route.post(
    '/api/exports/:tableExportId/rows/:id/sync',
    'ClientsData/Rows/TableExportRowsController.syncRowExcel'
  )

  // [Exports-Row] Row Status Change
  Route.post(
    '/api/exports/rows/:statusName/:id/:status',
    'ClientsData/Rows/TableExportRowsController.updateRowStatus'
  )

  // Clients
  Route.get('/api/clients/:id', 'Api/ClientsController.show')
  Route.get('/api/clients/:id/entries', 'Api/ClientsController.showEntries')
  Route.get('/api/clients', 'Api/ClientsController.index')

  // Helpers
  Route.post('/api/helpers/address/resolve', 'Helpers/AddressesController.resolve')
}).middleware('auth:api')

// FileSystem
Route.get('/api/filesystem', 'Api/FileSystemsController.show')

// Helpers
// Banks
Route.get('/api/banks', 'Helpers/BanksController.index')
