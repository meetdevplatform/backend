const { isEmpty } = require('lodash')
const { Admin, User, Tag, Categories } = require('../../db/models')
const { genJWTToken, removeToken, encryptString } = require('../common/helpers/admin-auth')
const logger = require('../common/helpers/logger')
const { STATUS_CODE } = require('../common/helpers/response-code')
const { encrypt, decrypt } = require('../common/helpers/crypto')
const { Response, systemError } = require('../common/response-formatter')

const {
    AUTHENTICATION,
    LOGIN,
    LOGOUT,
    ADMIN,
    PROJECT,
    TYPE_LOG
} = require('../common/helpers/constant')

const ADMIN_TOKEN_EXPIRED = 60 * 60 * 1 // expires in 30 days

const register = async (req, res) => {
    const {
        username,
        password
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, ADMIN.SUCCESS, '')
    try {
        const existedUser = await Admin.findOne({ username: username })
        if (isEmpty(existedUser)) {
            const userData = {
                username: username,
                password: encrypt(password)
            }
            await Admin.create(userData)
        } else {
            response.statusCode = STATUS_CODE.EXISTED_VALUE
            response.message = ADMIN.EMAIL_EXIST
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, admin cannot register: ', err.stack)
        response = systemError(ADMIN.EXCEPTION)
    }
    res.send(response)
}

/**
 * User login API
 * @param {*} req: in body, pass through (email, password)
 * @param {*} res: if login is successful, return user's info and token
 *                 otherwise return error code as API's document
 */
const login = async (req, res) => {
    const {
        username,
        password
    } = req.body
    let response = Response(STATUS_CODE.SUCCESS, LOGIN.SUCCESS, '')

    try {
        const existedAdmin = await Admin.findOne({ username: `${username}` })

        if (isEmpty(existedAdmin)) {
            response.statusCode = STATUS_CODE.NOT_FOUND
            response.message = LOGIN.INVALID_ACCOUNT
        } else if (password !== decrypt(existedAdmin.password)) {
            response.statusCode = STATUS_CODE.INVALID_VALUE
            response.message = LOGIN.WRONG_PASS_EMAIL
        } else {
            const token = await genJWTToken(`${username}`, ADMIN_TOKEN_EXPIRED)

            response.data = {
                usern: existedAdmin.username,
                tokenn: token,
                user: encryptString(existedAdmin.username),
                token: encryptString(token)
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Admin cannot login: ', err.stack)
        response = systemError(LOGIN.EXCEPTION)
    }
    res.send(response)
}

const logout = async (req, res) => {
    let response = Response(STATUS_CODE.SUCCESS, LOGOUT.SUCCESS, '')
    const token = req.headers.authorization.split(' ')[1]
    try {
        await removeToken(token)
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Admin cannot logout: ', err.stack)
        response = systemError(LOGOUT.EXCEPTION)
    }
    res.send(response)
}

const getAllUsers = async (req, res) => {
    const {
        adminId,
        userOwn
    } = req.body
    
    let response = Response(STATUS_CODE.SUCCESS, ADMIN.SUCCESS, '')

    try {
        if (userOwn !== adminId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            response.data = await User.find({}, { profile_picture: 1, full_name: 1, email: 1, email_status: 1, createdAt: 1, total_project_count: 1 })
        }
    } catch (err) {
        logger.error(TYPE_LOG.ADMIN, 'Exeption, cannot get project: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const addTag = async (req, res) => {
    const {
        adminId,
        userOwn,
        tagName
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, ADMIN.SUCCESS, '')

    try {
        if (userOwn !== adminId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            const tag = await Tag.find()
            tag[0].all_tags[tagName] = 0
            await Tag.findByIdAndUpdate(tag[0]._id, {
                $set: {
                    all_tags: tag[0].all_tags
                }
            })
        }
    } catch (err) {
        logger.error(TYPE_LOG.ADMIN, 'Exeption, cannot add tag: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const getAllTags = async (req, res) => {
    const {
        adminId,
        userOwn
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, ADMIN.SUCCESS, '')

    try {
        if (userOwn !== adminId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            response.data = await Tag.find()
        }
    } catch (err) {
        logger.error(TYPE_LOG.ADMIN, 'Exeption, cannot get tags: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const addCategory = async (req, res) => {
    const {
        adminId,
        userOwn,
        categoryName
    } = req.body
    console.log(req.body)
    let response = Response(STATUS_CODE.SUCCESS, ADMIN.SUCCESS, '')

    try {
        if (userOwn !== adminId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            const category = await Categories.find()
            category[0].all_category[categoryName] = 0
            await Categories.findByIdAndUpdate(category[0]._id, {
                $set: {
                    all_category: category[0].all_category
                }
            })
        }
    } catch (err) {
        logger.error(TYPE_LOG.ADMIN, 'Exeption, cannot add category: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

const getAllCategory = async (req, res) => {
    const {
        adminId,
        userOwn
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, ADMIN.SUCCESS, '')

    try {
        if (userOwn !== adminId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            response.data = await Categories.find()
        }
    } catch (err) {
        logger.error(TYPE_LOG.ADMIN, 'Exeption, cannot get categorys: ', err.stack)
        response = systemError(PROJECT.EXCEPTION)
    }
    res.send(response)
}

// const getAllUsers = async (req, res) => {
//     let {
//         adminId,
//         userOwn
//     } = req.body

//     let response = Response(STATUS_CODE.SUCCESS, PROJECT.FETCH, '')

//     try {
//         if (userOwn !== adminId) {
//             response.statusCode = STATUS_CODE.UNAUTHORIZATION
//             response.message = AUTHENTICATION.UNAUTHORIZED
//         } else {
//             if (pageSize && pageNo) {
//                 response.data = await User.find({}, { full_name: 1, email: 1, username: 1, profile_picture: 1 }).sort({ created_at: 1 }).skip(pageSize - (pageNo - 1)).limit(pageSize)
//             } else {
//                 pageSize = 50
//                 pageNo = 1
//                 response.data = await Project.find({}, { title: 1, thumbnailImage: 1, tag_line: 1, like_count: 1 }).sort({ created_at: 1 }).skip(pageSize - (pageNo - 1)).limit(pageSize)
//             }
//         }
//     } catch (err) {
//         console.log(err)
//         logger.error(TYPE_LOG.USER, `Exeption, Cannot fetch project for users single: ${single}: `, err.stack)
//         response = systemError(PROJECT.EXCEPTION)
//     }
//     res.send(response)
// }

module.exports = {
    register,
    login,
    logout,
    getAllUsers,
    addTag,
    getAllTags,
    addCategory,
    getAllCategory
}
