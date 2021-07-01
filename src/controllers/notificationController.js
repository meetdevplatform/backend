const { Notification, User } = require('../../db/models')
const logger = require('../common/helpers/logger')
const { STATUS_CODE } = require('../common/helpers/response-code')
const { Response, systemError } = require('../common/response-formatter')
const {
    NOTIFICATION,
    TYPE_LOG
} = require('../common/helpers/constant')

const addNotification = async (data) => {
    const {
        actorId,
        notifierId,
        type,
        entityTypeId
    } = data
    let response = Response(STATUS_CODE.SUCCESS, NOTIFICATION.SEND, '')

    try {
        const notification = {
            actor_id: actorId,
            notifier_id: notifierId,
            notification_type: type,
            entity_type_id: entityTypeId
        }

        await Notification.create(notification)
        await addNotificationCountForUser(notifierId)
    } catch (err) {
        logger.error(TYPE_LOG.MESSAGE, `Exeption-${actorId}, notification cannot be send`, err.stack)
        response = systemError(NOTIFICATION.EXCEPTION)
    }

    return response
}

const getAllForUser = async (username, toFetch, currentPage) => {
    let response = Response(STATUS_CODE.SUCCESS, NOTIFICATION.FETCH, '')

    try {
        let notificationToFetch = 30
        let forPage = 1
        if (toFetch && currentPage) {
            notificationToFetch = toFetch
            forPage = currentPage
        }
        response.data = await Notification.find({ notifier_id: username }).populate('entity_type_id', { thumbnail_image: 1 }).sort({ created_at: -1 }).skip(notificationToFetch * (forPage - 1)).limit(notificationToFetch)
    } catch (err) {
        logger.error(TYPE_LOG.MESSAGE, `Exeption-${username}, notification cannot be fetch for users`, err.stack)
        response = systemError(NOTIFICATION.EXCEPTION)
    }

    return response
}

const markRead = async (id) => {
    let response = Response(STATUS_CODE.SUCCESS, NOTIFICATION.READED, '')
    try {
        await Notification.findByIdAndUpdate(id, {
            $set: {
                read: true
            }
        })
    } catch (err) {
        logger.error(TYPE_LOG.MESSAGE, `Exeption-${id}, notification cannot be mark as readed`, err.stack)
        response = systemError(NOTIFICATION.EXCEPTION)
    }

    return response
}

const addNotificationCountForUser = async (username) => {
    let response = Response(STATUS_CODE.SUCCESS, NOTIFICATION.SUCCESS, '')
    try {
        await User.findAndUpdate({ username: username }, {
            $inc: {
                unread_notifications: 1
            }
        })
    } catch (err) {
        logger.error(TYPE_LOG.MESSAGE, `Exeption-${username}, add notification count for user`, err.stack)
        response = systemError(NOTIFICATION.EXCEPTION)
    }

    return response
}

const markUserNotificationRead = async (username) => {
    let response = Response(STATUS_CODE.SUCCESS, NOTIFICATION.READED, '')
    try {
        await User.findAndUpdate({ username: username }, {
            $set: {
                unread_notifications: 0
            }
        })
    } catch (err) {
        logger.error(TYPE_LOG.MESSAGE, `Exeption-${username}, mark notification ad readed`, err.stack)
        response = systemError(NOTIFICATION.EXCEPTION)
    }

    return response
}

module.exports = {
    addNotification,
    getAllForUser,
    markRead,
    addNotificationCountForUser,
    markUserNotificationRead
}
