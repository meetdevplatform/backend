const { Project, User, Tag } = require('../../db/models')
const uniqid = require('uniqid')
const logger = require('../common/helpers/logger')
const { STATUS_CODE } = require('../common/helpers/response-code')
const { Response, systemError } = require('../common/response-formatter')

const {
    AUTHENTICATION,
    PROJECT,
    TYPE_LOG
} = require('../common/helpers/constant')
const { addNotification } = require('./notificationController')

const addProject = async (req, res) => {
    let {
        userOwn,
        userId,
        title,
        tagLine,
        thumbnailImage,
        story,
        video,
        codeBaseLink,
        teamMember,
        category,
        tags
    } = req.body
    console.log(req.body)
    let response = Response(STATUS_CODE.SUCCESS, PROJECT.SUCCESS, '')

    try {
        if (userId !== userOwn) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            const project = {
                title: title,
                thumbnail_image: thumbnailImage,
                tag_line: tagLine,
                story: story,
                video: video,
                code_base_link: codeBaseLink,
                team_member: teamMember,
                category: category,
                tags: tags,
                owner: userId
            }
            await Project.create(project)
            await User.findByIdAndUpdate(userId, {
                $inc: {
                    total_project_count: 1,
                    pending_project_count: 1
                }
            })
        }
    } catch (err) {
        console.log(err)
        logger.error(TYPE_LOG.USER, 'Exeption, user cannot add project: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const updateProject = async (req, res) => {
    let {
        userOwn,
        userId,
        projectId,
        title,
        tagLine,
        thumbnailImage,
        story,
        video,
        codeBaseLink,
        teamMember,
        tags
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.UPDATED, '')

    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            const project = await Project.findById(projectId)
            title = title || project.title
            thumbnailImage = thumbnailImage || project.thumbnail_image
            tagLine = tagLine || project.tag_line
            story = story || project.story
            video = video || project.video
            codeBaseLink = codeBaseLink || project.code_base_link
            teamMember = teamMember || project.team_member
            tags = tags || project.tags

            await Project.findByIdAndUpdate(projectId, {
                $set: {
                    title: title,
                    thumbnail_image: thumbnailImage,
                    tag_line: tagLine,
                    story: story,
                    video: video,
                    code_base_link: codeBaseLink,
                    team_member: teamMember,
                    tags: tags
                }
            })
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, user cannot update project: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const getProjectForUsers = async (req, res) => {
    let {
        projectId,
        single,
        pageSize,
        pageNo
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.FETCH, '')

    try {
        if (single) {
            // project = await Project.find({ $and: [{ _id: projectId, status: 1 }] }, { likes: -1, status: -1 }).populate('team_member', { username: 1, profile_picture: 1 }).populate('comment.username', { username: 1, profile_picture: 1 })
            response.data = await Project.find({ $and: [{ _id: projectId, status: 1 }] }, { likes: 0, status: 0 }).populate({ path: 'comments', populate: { path: 'user_id', select: ['full_name', 'profile_picture'] } }).populate({ path: 'comments.reply', populate: { path: 'user_id', select: ['full_name', 'profile_picture'] } })
        } else {
            if (pageSize && pageNo) {
                response.data = await Project.find({}, { title: 1, thumbnailImage: 1, tag_line: 1, like_count: 1 }).sort({ created_at: 1 }).skip(pageSize * (pageNo - 1)).limit(pageSize)
            } else {
                pageSize = 50
                pageNo = 1
                response.data = await Project.find({}, { title: 1, thumbnailImage: 1, tag_line: 1, like_count: 1 }).sort({ created_at: 1 }).skip(pageSize * (pageNo - 1)).limit(pageSize)
            }
        }
    } catch (err) {
        console.log(err)
        logger.error(TYPE_LOG.USER, `Exeption, Cannot fetch project for users, single: ${single}: `, err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const saveProject = async (req, res) => {
    const {
        userOwn,
        userId,
        projectId
    } = req.body
    let response = Response(STATUS_CODE.SUCCESS, PROJECT.FETCH, '')

    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            await User.findByIdAndUpdate(userId, {
                $addToSet: {
                    saved_project: projectId
                }
            })
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, `Exeption, Cannot save project for users`, err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const getUserPostedProjects = async (req, res) => {
    let {
        userId,
        userOwn,
        saved
    } = req.query

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.FETCH, '')

    try {
        if (userId !== userOwn) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            if (saved) {
                response.data = await User.findById(userId).populate('saved_project', { title: 1, thumbnailImage: 1, tag_line: 1, like_count: 1, status: 1 })
            } else {
                response.data = await Project.find({ owner: userId }, { title: 1, thumbnailImage: 1, tag_line: 1, like_count: 1, status: 1 })
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, `Exeption, Cannot fetch project for a user saved: ${saved}: `, err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const getProjectForCategory = async (req, res) => {
    let {
        category,
        pageSize,
        pageNo
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.FETCH, '')

    try {
        if (pageSize && pageNo) {
            response.data = await Project.find({ category: { $in: category } }, { title: 1, thumbnailImage: 1, tag_line: 1, like_count: 1 }).sort({ created_at: 1 }).skip(pageSize * (pageNo - 1)).limit(pageSize)
        } else {
            pageSize = 50
            pageNo = 1
            response.data = await Project.find({ category: { $in: category } }, { title: 1, thumbnailImage: 1, tag_line: 1, like_count: 1 }).sort({ created_at: 1 }).skip(pageSize * (pageNo - 1)).limit(pageSize)
        }
    } catch (err) {
        console.log(err)
        logger.error(TYPE_LOG.USER, `Exeption, Cannot fetch projects for category : ${category} `, err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const userTagProject = async (req, res) => {
    let {
        userOwn,
        userId
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.FETCH, '')

    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            response.data = await Project.find({ 'team_member.id': userId }, { title: 1, thumbnailImage: 1, tag_line: 1, like_count: 1 }).sort({ created_at: 1 })
        }
    } catch (err) {
        console.log(err)
        logger.error(TYPE_LOG.USER, `Exeption, Cannot fetch tag project for users: `, err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const incrementView = async (req, res) => {
    let {
        userId,
        userOwn,
        projectId
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.VIEW, '')

    try {
        response.data = await Project.aggregate([{$project: { count: { $size:"$team_member" }}}])
        // if (userOwn !== userId) {
        //     response.statusCode = STATUS_CODE.UNAUTHORIZATION
        //     response.message = AUTHENTICATION.UNAUTHORIZED
        // } else {
        //     await Promise.all([
        //         Project.findByIdAndUpdate(projectId, {
        //             $inc: {
        //                 views: 1
        //             }
        //         })

        //     ])
        // }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, cannot increment view for project: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const likeProject = async (req, res) => {
    let {
        projectId,
        userId,
        userOwn
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.LIKED, '')

    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            await Promise.all([
                Project.findByIdAndUpdate(projectId, {
                    $inc: {
                        like_count: 1
                    },
                    $addToSet: {
                        likes: userId
                    }
                }),
                User.findByIdAndUpdate(userId, {
                    $addToSet: {
                        liked_project: projectId
                    }
                })

            ])
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, user cannot like project: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const unlikeProject = async (req, res) => {
    let {
        id,
        userId,
        userOwn
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.LIKED, '')

    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            await Promise.all([
                Project.findByIdAndUpdate(id, {
                    $inc: {
                        like_count: -1
                    },
                    $pull: {
                        likes: userId
                    }
                }),
                User.findByIdAndUpdate(userId, {
                    $pull: {
                        liked_project: id
                    }
                })

            ])
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, user cannot unlike project: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const searchProject = async (req, res) => {
    let {
        keyword
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.SEARCH, '')

    try {
        response.data = await Project.find({ $text: { $search: keyword } })
    } catch (err) {
        logger.error(TYPE_LOG.USER, `Exeption, user cannot search for keywork: ${keyword} `, err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const comment = async (req, res) => {
    const {
        userOwn,
        userId,
        projectId,
        text,
        mentions,
        reply,
        commentId
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.COMMENT, '')
    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            if (!reply) {
                const commentData = {
                    id: uniqid(),
                    user_id: userId,
                    text: text,
                    reply: [],
                    upvote: 0,
                    created_at: Date.now()
                }
                await Project.findByIdAndUpdate(projectId, {
                    $push: {
                        comments: commentData
                    }
                })
            } else {
                const replyData = {
                    id: uniqid(),
                    user_id: userId,
                    text: text,
                    upvote: 0,
                    created_at: Date.now()
                }
                await Project.findOneAndUpdate({ 'comments.id': commentId }, {
                    $push: {
                        'comments.$.reply': replyData
                    }
                })
            }
            // If comment has mention any of the users we will inform to them my sending the notifications 
            if (mentions.length) {
                await Promise.all(
                    mentions.map(async id => {
                        await addNotification({ actorId: userId, notifierId: id, type: 4, entityTypeId: projectId })
                    })
                )
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, user cannot comment on project: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const deleteComment = async (req, res) => {
    const {
        userOwn,
        userId,
        projectId,
        commentId,
        replyId,
        reply
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.DELETECOMMENT, '')
    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            if (!reply) {
                await Project.findByIdAndUpdate(projectId, {
                    $pull: { comments: { id: commentId } }
                })
            } else {
                await Project.findOneAndUpdate({ 'comments.id': commentId }, {
                    $pull: {
                        'comments.$.reply': { id: replyId }
                    }
                })
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, user cannot delete the comment: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const changeStatus = async (req, res) => {
    let {
        id,
        status,
        adminId,
        ownerId,
        userOwn
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, status === 1 ? PROJECT.APPROVED : PROJECT.REJECTED, '')

    try {
        if (userOwn !== adminId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            await Project.findByIdAndUpdate(id, {
                $set: {
                    status: status
                }
            })

            if (status === 1) {
                await User.findByIdAndUpdate(ownerId, {
                    $inc: {
                        approved_project_count: 1
                    }
                })

                const project = await Project.findById(id)
                let tags = project.tags
                let allTags = await Tag.find()

                allTags = allTags[0]
                for (let i = 0; i < tags.length; i++) {
                    if (allTags.all_tags[tags[i]]) {
                        allTags.all_tags[tags[i]]++
                    } else {
                        allTags.all_tags[tags[i]] = 1
                    }
                }
                await Tag.findByIdAndUpdate(allTags._id, {
                    $set: {
                        all_tags: allTags.all_tags
                    }
                })
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, user cannot add project: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const test = async (req, res) => {
    let {
        users
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, PROJECT.UPDATED, '')

    try {
        await User.updateMany({ _id: { $in: users } }, { $inc: { unread_notifications: 1 } })
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, user cannot add project: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}
module.exports = {
    addProject,
    updateProject,
    saveProject,
    incrementView,
    likeProject,
    userTagProject,
    unlikeProject,
    comment,
    deleteComment,
    getProjectForUsers,
    getUserPostedProjects,
    getProjectForCategory,
    searchProject,

    // Admin
    // \9T@CefHKb=5s%m3GL"QY5s'4,66tW5d
    changeStatus,
    test
}
