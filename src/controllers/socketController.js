const { STATUS_CODE } = require('../common/helpers/response-code')
const { sendMesssage, addActiveUser, unActiveUser, unreadMessage, getFriends, getAllActiveUsers, messageReaded, isUserActive, changeCurrentChatWindow, currentChatWindow } = require('./messageController')
const { addNotification } = require('./notificationController')
module.exports = (io) => {
    io.on('connection', socket => {
        console.log('user connected')
        socket.on('join', (username) => {
            socket.ID = username
            console.log('connected', socket.ID)
            socket.join(username)
            socket.broadcast.emit('userJoined', { message: 'New User Connected', id: username })
            addActiveUser(username) 
        })

        socket.on('getActiveFriends', async (username) => {
            const [allActiveUsersList, friendsList] = Promise.all([
                await getAllActiveUsers(),
                await getFriends(username)
            ])
            let friends = {}
            for (let i = 0; i < friendsList.length; i++) {
                if (allActiveUsersList[friendsList[i].username.username] === 'none') {
                    friends[friendsList[i].username.username] = {
                        online: true,
                        fullName: friendsList[i].username.full_name,
                        profilePicture: friendsList[i].username.profile_picture,
                        unreadMessages: friendsList[i].unread_messages
                    }
                } else {
                    friends[friendsList[i].username.username] = {
                        online: false,
                        fullName: friendsList[i].username.full_name,
                        profilePicture: friendsList[i].username.profile_picture,
                        unreadMessages: friendsList[i].unread_messages
                    }
                }
            }
            io.to(username).emit('seefriends', friends)
        })

        socket.on('chatMessage', async (userMessage) => {
            let addMessage
            // When User is active and is on same chat window as from which message is delivered
            let isActive = await isUserActive(userMessage.to)
            let chatWindow = await currentChatWindow(userMessage.to)
            if (isActive && chatWindow === userMessage.from) {
                addMessage = await sendMesssage(userMessage) // add new message
                if (addMessage[0].statusCode !== STATUS_CODE.SUCCESS) {
                    io.to(userMessage.from).emit('message', addMessage)
                } else {
                    io.to(userMessage.to).emit('message', formatMessage(userMessage.from, userMessage.message, STATUS_CODE.SUCCESS)) // and emit msg to user
                }
            } else { 
                // When user is active but not the same chat window as from which message is delivered
                addMessage = await Promise.all([
                    sendMesssage(userMessage), // Add new message
                    unreadMessage(userMessage.from, userMessage.to) // Increment the unread message count for the user from which message is delivered
                ])
                if (addMessage[0].statusCode !== STATUS_CODE.SUCCESS) {
                    io.to(userMessage.from).emit('message', addMessage)
                } else {
                    if (isActive && chatWindow !== userMessage.from) {
                        if (userMessage.connect) io.to(userMessage.to).emit('newFriend', { id: userMessage.from, full_name: userMessage.userDetails.senderName, profile_picture: userMessage.userDetails.senderProfilePicture })
                        io.to(userMessage.to).emit('unreadMessage', formatMessage(userMessage.from, 'Unread Message', STATUS_CODE.SUCCESS))
                    }
                }
            }
        })

        /**
         * Notification for users
         * data object keys
         * @param {*} actorId 
         * @param {*} notifierId 
         * @param {*} type 
         * @param {*} entityTypeId 
         * @param {*} entityDescData 
         */
        socket.on('notification', async (data) => {
            let notify = await addNotification(data)
            let isActive = await isUserActive(data.notifierId)
            if (notify.statusCode === 7000 && isActive) {
                io.to(data.notifierId).emit('notification', { actorId: data.actorId, type: data.type, entityTypeId: data.entityTypeId, entityDescData: data.entityDescData })
            } 
        })

        socket.on('changedChatWindow', async (user) => {
            if (user.unreadMessage !== 0) {
                messageReaded(user.from, user.to)
            }
            changeCurrentChatWindow(user.from, user.to)
        })

        socket.on('disconnect', (s) => {
            console.log('disconnected', socket.ID)
            unActiveUser(socket.ID)
            socket.broadcast.emit('userDisconnected', { message: 'User Disconnected', id: socket.ID })
        })
    })
}

const formatMessage = (userId, text, statusCode) => {
    return {
        statusCode: statusCode,
        userId: userId,
        message: text,
        time: Date.now()
    }
}
