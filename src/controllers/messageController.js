const { isEmpty } = require('lodash')
const { User, Message } = require('../../db/models')
const logger = require('../common/helpers/logger')
const { STATUS_CODE } = require('../common/helpers/response-code')
const { Response, systemError } = require('../common/response-formatter')
const { redisClient } = require('../common/helpers/redisClient')
const {
    MESSAGE,
    TYPE_LOG,
    AUTHENTICATION
} = require('../common/helpers/constant')

const sendMesssage = async (userDetails, decodeToken) => {
    const {
        from,
        to,
        message,
        type,
        connect
    } = userDetails

    let response = Response(STATUS_CODE.SUCCESS, MESSAGE.SEND, '')

    try {
        if (from !== decodeToken) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            if (connect) {
                await Promise.all([
                    User.findAndUpdate({ username: from }, {
                        $addToSet: {
                            friends: {
                                username: to
                            }
                        }
                    }),
                    User.findAndUpdate({ username: to }, {
                        $addToSet: {
                            friends: {
                                username: from
                            }
                        }
                    })
                ])
            }
            const msg = {
                from: from,
                to: to,
                content: message,
                type: type
            }
            await Message.create(msg)
        }
    } catch (err) {
        logger.error(TYPE_LOG.MESSAGE, `Exeption-${from}, message cannot be send`, err.stack)
        response = systemError(MESSAGE.EXCEPTION)
    }
    return response
}

const getPreviousMessages = async (req, res) => {
    const {
        userOwn,
        username,
        to
    } = req.body
    let response = Response(STATUS_CODE.SUCCESS, MESSAGE.FETCH, '')

    try {
        if (userOwn !== username) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            // const messages = await Message.find({ $and: [{ from: userId, to: to }] }, { from: 1, to: 1, content: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(30)
            const messages = await Message.find({ $or: [{ $and: [{ from: username, to: to }] }, { $and: [{ from: to, to: username }] }] }, { from: 1, to: 1, content: 1, createdAt: 1 }).sort({ createdAt: 1 }).limit(30)

            if (isEmpty(messages)) {
                response.statusCode = STATUS_CODE.NOT_FOUND
                response.message = MESSAGE.NOT_FOUND
            } else {
                response.data = messages
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.MESSAGE, `Exeption-${username}, cannot fetch messages for ${to}`, err.stack)
        response = systemError(MESSAGE.EXCEPTION)
    }

    res.send(response)
}

const unreadMessage = async (from, to) => {
    let response = Response(STATUS_CODE.SUCCESS, MESSAGE.SEND, '')
    try {
        const user = await User.find({ username: to })
        for (let i = 0; i < user.friends.length; i++) {
            if (user.friends[i].username === from) {
                user.friends[i].unread_messages++
                break
            }
        }
        await User.findByIdAndUpdate(to, {
            $set: {
                friends: user.friends
            }
        })
    } catch (err) {
        logger.error(TYPE_LOG.MESSAGE, `Exeption-${from}, message cannot be send`, err.stack)
        response = systemError(MESSAGE.EXCEPTION)
    }
    return response
}

const addActiveUser = async (username) => {
    const activeUsers = JSON.parse(await redisClient.getAsync('activeUsers'))
    activeUsers[username] = null
    await redisClient.setAsync('activeUsers', JSON.stringify(activeUsers))
}

const unActiveUser = async (username) => {
    const activeUsers = JSON.parse(await redisClient.getAsync('activeUsers'))
    delete activeUsers[username]
    console.log(activeUsers, 'remove form active')
    await redisClient.setAsync('activeUsers', JSON.stringify(activeUsers))
    return true
}

const isUserActive = async (username) => {
    const activeUsers = JSON.parse(await redisClient.getAsync('activeUsers'))
    if (activeUsers[username]) {
        return true
    } else {
        return false
    }
}

const getAllActiveUsers = async () => {
    const activeUsers = JSON.parse(await redisClient.getAsync('activeUsers'))
    return activeUsers
}

const changeCurrentChatWindow = async (username, chattingTo) => {
    const activeUsers = JSON.parse(await redisClient.getAsync('activeUsers'))
    activeUsers[username] = chattingTo
}

const currentChatWindow = async (username) => {
    const activeUsers = JSON.parse(await redisClient.getAsync('activeUsers'))
    return activeUsers[username]
}

const messageReaded = async (from, to) => {
    let response = Response(STATUS_CODE.SUCCESS, MESSAGE.SEND, '')
    try {
        const user = await User.find({ username: to })
        for (let i = 0; i < user.friends.length; i++) {
            if (user.friends[i].username === from) {
                user.friends[i].unread_messages = 0
                break
            }
        }
        await User.findAndUpdate({ username: to }, {
            $set: {
                friends: user.friends
            }
        })
    } catch (err) {
        logger.error(TYPE_LOG.MESSAGE, `Exeption-${from}, message cannot be send`, err.stack)
        response = systemError(MESSAGE.EXCEPTION)
    }
    return response
}

const getFriends = async (username) => {
    const user = await User.find({ username: username }).populate('friends.username', { full_name: 1, profile_picture: 1 })
    return user.friends
}
module.exports = {
    sendMesssage,
    getPreviousMessages,
    unreadMessage,
    messageReaded,
    addActiveUser,
    unActiveUser,
    isUserActive,
    getAllActiveUsers,
    changeCurrentChatWindow,
    currentChatWindow,
    getFriends
}
