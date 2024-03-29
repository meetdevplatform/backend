const { Router } = require('express')

const routes = Router()

routes.use('/users', require('./users'))
routes.use('/project', require('./project'))
routes.use('/admin', require('./admin'))

module.exports = routes
