const { Router } = require('express')

const passport = require('passport')
const { isAuthenticate } = require('../common/helpers/auth')
const {
    signup, 
    reSendCode,
    login, 
    logout, 
    isExistedUser,
    updateProfilePic,
    updateUniversityDetails,
    updateOrganizationDetails,
    updateInterest,
    updateUser,
    getUser,
    follow,
    unFollow,
    getFollowersFollowing,
    getTrendingTags,
    verifyEmail, 
    resetPassword
} = require('../controllers')

const {
    validateSignup,
    validateLogin,
    validateVerifyEmail,
    validateResetPass
} = require('../common/validators')
// eslint-disable-next-line no-unused-vars
require('../common/helpers/social-login')
const { parseBody } = require('../common/helpers/http-request')

const routes = Router()

routes.post('/register', validateSignup, signup) 
routes.post('/resend', reSendCode)
routes.post('/login', validateLogin, login)
routes.post('/logout', isAuthenticate, logout)
routes.post('/check/username', isExistedUser)
routes.post('/details', getUser)
routes.post('/update-university', isAuthenticate, updateUniversityDetails)
routes.post('/update-organization', isAuthenticate, updateOrganizationDetails)
routes.post('/update/interest', isAuthenticate, updateInterest)
routes.post('/update', isAuthenticate, updateUser)

routes.post('/follow', follow)
routes.post('/unfollow', unFollow)
routes.post('/follower-following/all', getFollowersFollowing)

routes.get('/trendingtags', getTrendingTags)

routes.post('/update-profilepic', parseBody, updateProfilePic)

// Google Login
routes.get('/register/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))
routes.get('/google/callback', passport.authenticate('google', { failureRedirect: '/api/users/google/failure' }), async (req, res) => {
    console.log('after login', req.user)
    res.redirect(`http://localhost:4200/home?token=${req.user.token}&user=${req.user.user}`)
})
routes.get('/google/failure', (req, res) => {
    res.send(req.body)
})

routes.get('/register/github', passport.authenticate('github', { scope: ['user:email'] }))

routes.get('/github/callback', passport.authenticate('github', { failureRedirect: '/api/users/github/failure' }), async (req, res) => {
    res.send(JSON.stringify(req.user))
})

routes.get('/github/failure', (req, res) => {
    res.send(req.body)
})

routes.get('/register/linkedin', passport.authenticate('linkedin'), (req, res) => {})

routes.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/api/users/linkedin/failure' }), async (req, res) => {
    res.send(JSON.stringify(req.user))
})

routes.get('/linkedin/failure', (req, res) => {
    res.send(req.body)
})
routes.post('/email/verify', validateVerifyEmail, verifyEmail)
routes.post('/password/reset', validateResetPass, resetPassword)

module.exports = routes
