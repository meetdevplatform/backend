const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const passport = require('passport')
const socketio = require('socket.io')
const routes = require('./src/routes')
const { SERVER_PORT, NODE_ENV, FE_URL } = require('./config/config')
const { redisClient } = require('./src/common/helpers/redisClient')
// Connect to mongodb
require('./db')

const app = express()
// const server = http.createServer(app)

const allowCrossDomain = function (req, res, next) {
    if (NODE_ENV === 'development') {
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
    } else {
        res.header('Access-Control-Allow-Origin', `${FE_URL}`)
    }
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept')
    if (req.method === 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
}

app.use(allowCrossDomain)
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())

app.use('/ping', (req, res) => {
    res.json({
        msg: 'success'
    })
})

app.use('/api', routes)

const server = app.listen(SERVER_PORT, async (err) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(`App is running on port ${SERVER_PORT}`)
    await redisClient.setAsync('activeUsers', JSON.stringify({}))
})

const io = socketio(server, {
    cors: {
        origins: ['http://localhost:8000']
    }
})

require('./src/controllers/socketController')(io)

module.exports = app
