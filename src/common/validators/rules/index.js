const verifyEmail = require('./verify-email')
const signup = require('./signup')
const login = require('./login')
const resetPassword = require('./reset-password')
const addProject = require('./add-project')

module.exports = {
    verifyEmail,
    resetPassword,
    signup,
    login,
    addProject
}
