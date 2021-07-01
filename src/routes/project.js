const { Router } = require('express')

const { isAuthenticate } = require('../common/helpers/auth')
const {
    test,
    addProject,
    updateProject,
    saveProject,
    likeProject,
    unlikeProject,
    comment,
    incrementView,
    deleteComment,
    getProjectForUsers,
    getUserPostedProjects,
    searchProject
} = require('../controllers')

const {
    validateAddProject
} = require('../common/validators')

const { parseBody } = require('../common/helpers/http-request')

const routes = Router()

routes.post('/test', test) 

routes.post('/add', validateAddProject, isAuthenticate, addProject) 
routes.post('/update', updateProject) 
routes.post('/save', saveProject)
routes.post('/like', likeProject) 
routes.post('/unlike', unlikeProject) 
routes.post('/comment', isAuthenticate, comment) 
routes.post('/comment/delete', isAuthenticate, deleteComment) 
routes.post('/all', getProjectForUsers) 
routes.post('/users/all', isAuthenticate, getUserPostedProjects) 
routes.post('/search', searchProject) 
routes.post('/view', incrementView) 

module.exports = routes
