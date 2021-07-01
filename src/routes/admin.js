const { Router } = require('express')

const { isAuthenticate } = require('../common/helpers/admin-auth')

const {
    register,
    login,
    logout,
    getAllUsers,
    addTag,
    getAllTags,
    addCategory,
    getAllCategory
} = require('../controllers/adminController')

const routes = Router()

routes.post('/register', register) 
routes.post('/login', login) 
routes.post('/logout', logout)
routes.post('/users/all', getAllUsers) 
routes.post('/tag/add', isAuthenticate, addTag) 
routes.post('/tag/all', isAuthenticate, getAllTags) 
routes.post('/category/add', isAuthenticate, addCategory) 
routes.post('/category/all', isAuthenticate, getAllCategory) 

module.exports = routes
