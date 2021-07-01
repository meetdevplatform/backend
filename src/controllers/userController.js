const { isEmpty } = require('lodash')
const { User, Tag } = require('../../db/models')
const otpGenerator = require('otp-generator')
const { genJWTToken, removeToken, encryptString, encryptObject, userProfilePicture } = require('../common/helpers/auth')

const logger = require('../common/helpers/logger')
const { STATUS_CODE } = require('../common/helpers/response-code')
const { Response, systemError } = require('../common/response-formatter')
const sendEmail = require('../common/helpers/email')
const { encrypt, decrypt } = require('../common/helpers/crypto')
const { singleImageUpload } = require('../common/helpers/file-upload')
const {
    SIGNUP,
    LOGIN,
    LOGOUT,
    VERIFY_STATUS,
    TYPE_LOG,
    USER,
    FILE,
    AUTHENTICATION,
    VARIABLE
} = require('../common/helpers/constant')

const signup = async (req, res) => {
    const {
        fullName,
        email,
        username,
        password
    } = req.body
    let isSendEmail = false

    let response = Response(STATUS_CODE.SUCCESS, SIGNUP.SUCCESS, '')
    const pinCode = otpGenerator.generate(6, { specialChars: false })
    let validEmail = email.split('+')[0]
    validEmail = validEmail === email ? validEmail : validEmail + '@' + email.split('@')[1]
    try {
        const existedUser = await User.findOne({ email: `${validEmail}` })
        if (isEmpty(existedUser)) {
            const userData = {
                full_name: `${fullName}`,
                email: `${validEmail.toLocaleLowerCase()}`,
                username: `${username}`,
                code: pinCode,
                profile_picture: userProfilePicture[fullName.split(' ')[0][0].toLocaleUpperCase()],
                email_status: VERIFY_STATUS.UNVERIFIED,
                password: encrypt(password),
                expired_at: Date.now()
            }
            await User.create(userData)
            isSendEmail = true
        } else if (existedUser.email_status === VERIFY_STATUS.UNVERIFIED) {
            await User.findOneAndUpdate({ username: `${username}` },
                { code: pinCode, expired_at: Date.now() })

            isSendEmail = true
        } else {
            response.statusCode = STATUS_CODE.EXISTED_VALUE
            response.message = `${SIGNUP.EMAIL_EXIST}`
        }

        if (isSendEmail) {
            const emailParams = {
                name: fullName,
                info: pinCode
            }
            await sendEmail(email.toLocaleLowerCase(),
                emailParams, 'email_verification', 'Confirm your Platform account!')
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, user cannot signup: ', err.stack)
        response = systemError(SIGNUP.EXCEPTION)
    }
    res.send(response)
}

/**
 * Resend a `passcode` for verify account
 * @param {*} req: in body, pass through (email, first_name, last_name)
 * @param {*} res: Return error code as API's document
 */
const reSendCode = async (req, res) => {
    const pinCode = otpGenerator.generate(6, { specialChars: false })

    const {
        username,
        isSignup
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, SIGNUP.RESEND_CODE, { username: `${username}` })
    try {
        const existedUser = await User.findOne({ username: username })
        if (!isEmpty(existedUser)) {
            await User.findOneAndUpdate({ username: username }, { code: pinCode, expired_at: Date.now() })
            const emailParams = {
                name: existedUser.full_name,
                info: pinCode
            }
            if (isSignup) {
                await sendEmail(existedUser.email,
                    emailParams, 'email_verification', 'Confirm your Platform account!')
            } else {
                response.message = SIGNUP.RESEND_PWD
                await sendEmail(existedUser.email,
                    emailParams, 'reset_password', 'Reset your Platform password!')
            }
        } else {
            response.statusCode = STATUS_CODE.NOT_FOUND
            response.message = SIGNUP.USER_NOT_EXIST
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, ' Cannot resend PIN code for user: ', err.stack)
        response = systemError(SIGNUP.EXCEPTION)
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
        const existedUser = await User.findOne({ username: `${username}` }).populate('friends.username', { full_name: 1, profile_picture: 1 })

        if (isEmpty(existedUser)) {
            response.statusCode = STATUS_CODE.NOT_FOUND
            response.message = LOGIN.INVALID_ACCOUNT
        } else if (password !== decrypt(existedUser.password)) {
            response.statusCode = STATUS_CODE.INVALID_VALUE
            response.message = LOGIN.WRONG_PASS_EMAIL
        } else if (existedUser.email_status === VERIFY_STATUS.UNVERIFIED) {
            response.statusCode = STATUS_CODE.UNVERIFIED_EMAIL
            response.message = LOGIN.UNVERIFIED_MAIL
        } else if (existedUser.social_register && !existedUser.university_details.name) {
            response.statusCode = STATUS_CODE.INVALID_VALUE
            response.message = LOGIN.INCOMPLETE_PROFILE
        } else {
            const token = await genJWTToken(`${existedUser._id}`, VARIABLE.USER_TOKEN_EXPIRED)

            let userInfo = {
                userId: existedUser._id,
                username: existedUser.username,
                fullName: existedUser.full_name,
                profilePicture: existedUser.profile_picture,
                friends: existedUser.friends,
                formStep: existedUser.form_step
            }
            response.data = {
                usern: userInfo,
                tokenn: token,
                user: encryptObject(userInfo),
                token: encryptString(token)
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'User cannot login: ', err.stack)
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
        logger.error(TYPE_LOG.USER, 'User cannot logout: ', err.stack)
        response = systemError(LOGOUT.EXCEPTION)
    }
    res.send(response)
}

const isExistedUser = async (req, res) => {
    let response = Response(STATUS_CODE.NOT_FOUND, USER.SUCCESS, '')

    try {
        const {
            username
        } = req.body

        const existedUser = await User.findOne({ username: `${username}` })
        if (!isEmpty(existedUser)) {
            response.statusCode = STATUS_CODE.EXISTED_VALUE
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Cannot check username: ', err.stack)
        response = systemError(SIGNUP.EXCEPTION)
    }
    res.send(response)
}

const updateProfilePic = async (req, res) => {
    const { userOwn, userId, fileName } = req.body
    // console.log(req.file[0], 'nkn')
    // const t = await singleImageUpload(req.file[0], 'ProfilePicture', 'mohit')
    // console.log(t)
    // res.send(t)
    let response = Response(STATUS_CODE.SUCCESS, FILE.SUCCESS, '')
    try {
        if (userId !== userOwn) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            if (req.file[0]) {
                const image = await singleImageUpload(
                    req.file[0],
                    'ProfilePicture',
                    `${fileName}`
                )
                await User.findByIdAndUpdate(
                    { _id: userId },
                    {
                        $set: {
                            profile_picture: image.responsive_breakpoints[0].breakpoints
                        }
                    }
                )
                response.data = image.responsive_breakpoints[0].breakpoints
            } else {
                response.statusCode = STATUS_CODE.NOT_FOUND
                response.message = FILE.NOT_FOUND
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, ` Cannot Update Profile Pic for user: ${fileName}`, err.stack)
        response = systemError(FILE.EXCEPTION)
    }
    res.send(response)
}

const updateUniversityDetails = async (req, res) => {
    let {
        userOwn,
        userId,
        role,
        universityName,
        degree,
        course,
        startingDate,
        endingDate
    } = req.body
    console.log(req.body)
    let response = Response(STATUS_CODE.SUCCESS, USER.UPDATED, '')
    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            const existedUser = await User.findById(userId)
            if (isEmpty(existedUser)) {
                response.statusCode = STATUS_CODE.NOT_FOUND
                response.message = USER.NOT_EXIST
            } else {
                await User.findByIdAndUpdate({ _id: userId }, {
                    $set: {
                        is_college_student: role,
                        'university_details.name': universityName,
                        'university_details.degree_type': degree,
                        'university_details.course': course,
                        'university_details.starting_year': startingDate,
                        // 'university_details.completion_year': endingDate,
                        form_step: 2
                    }
                })
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exception: Failed to update university details ', err.stack)
        response = systemError(USER.EXCEPTION)
    }
    res.send(response)   
}

const updateOrganizationDetails = async (req, res) => {
    let {
        userOwn,
        userId,
        role,
        organizationName,
        position,
        startingDate,
        endingDate
    } = req.body
    let response = Response(STATUS_CODE.SUCCESS, USER.UPDATED, '')
    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            const existedUser = await User.findById(userId)
            if (isEmpty(existedUser)) {
                response.statusCode = STATUS_CODE.NOT_FOUND
                response.message = USER.NOT_EXIST
            } else {
                await User.findByIdAndUpdate({ _id: userId }, {
                    $set: {
                        is_college_student: role,
                        'university_details.name': organizationName,
                        'university_details.position': position,
                        'university_details.starting_year': startingDate,
                        'university_details.completion_year': endingDate,
                        form_step: 2
                    }
                })
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exception: Failed to update university details ', err.stack)
        response = systemError(USER.EXCEPTION)
    }
    res.send(response)   
}

const updateInterest = async (req, res) => {
    let {
        userOwn,
        userId,
        interest
    } = req.body
    let response = Response(STATUS_CODE.SUCCESS, USER.UPDATED, '')
    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            const existedUser = await User.findById(userId)
            if (isEmpty(existedUser)) {
                response.statusCode = STATUS_CODE.NOT_FOUND
                response.message = USER.NOT_EXIST
            } else {
                await User.findByIdAndUpdate({ _id: userId }, {
                    $set: {
                        interest: interest,
                        form_step: 4
                    }
                })
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exception: Failed to update user profile ', err.stack)
        response = systemError(USER.EXCEPTION)
    }
    res.send(response)   
}

const updateUser = async (req, res) => {
    let {
        userOwn,
        userId,
        address,
        bio,
        specialization,
        skills,
        interest,
        isCollegeStudent,
        isTechEmployee,
        social,
        universityDetails
    } = req.body
    let response = Response(STATUS_CODE.SUCCESS, USER.UPDATED, '')
    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            const existedUser = await User.findById(userId)
            if (isEmpty(existedUser)) {
                response.statusCode = STATUS_CODE.NOT_FOUND
                response.message = USER.NOT_EXIST
            } else {
                address = address || existedUser.address
                bio = bio || existedUser.bio
                specialization = specialization || existedUser.specialization
                skills = skills || existedUser.skills
                interest = interest || existedUser.interest
                isCollegeStudent = isCollegeStudent || existedUser.is_college_student
                isTechEmployee = isTechEmployee || existedUser.is_tech_employee
                social = JSON.parse(social) || existedUser.social
                universityDetails = JSON.parse(universityDetails) || existedUser.universityDetails
                await User.findByIdAndUpdate({ _id: userId }, {
                    $set: {
                        address: address,
                        bio: bio,
                        specialization: specialization,
                        skills: skills,
                        interest: interest,
                        is_college_student: isCollegeStudent,
                        is_tech_employee: isTechEmployee,
                        social: social,
                        universityDetails: universityDetails
                    }
                })
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exception: Failed to update user profile ', err.stack)
        response = systemError(USER.EXCEPTION)
    }
    res.send(response)
}

const getUser = async (req, res) => {
    const {
        userOwn,
        userId
    } = req.body

    let response = Response(STATUS_CODE.SUCCESS, USER.SUCCESS, '')
    try {
        if (userOwn !== userId) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            const user = await User.findById(userId)
            if (isEmpty(user)) {
                response.statusCode = STATUS_CODE.NOT_FOUND
                response.message = USER.NOT_EXIST
            } else {
                response.data = {
                    userId: user._id,
                    fullName: user.full_name,
                    email: user.email,
                    profilePicture: user.profile_picture,
                    address: user.address,
                    bio: user.bio,
                    specialization: user.specialization,
                    skills: user.skills,
                    interest: user.interest,
                    isCollegeStudent: user.is_college_student,
                    isTechEmployee: user.is_tech_employee,
                    social: user.social,
                    universityDetails: user.university_details,
                    totalProjectCount: user.total_project_count,
                    approvedProjectCount: user.approved_project_count,
                    likedProject: user.liked_project,
                    savedProject: user.saved_project
                }
            }
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exception: Failed to fetch user profile ', err.stack)
        response = systemError(USER.EXCEPTION)
    }
    res.send(response)
}

const follow = async (req, res) => {
    const {
        userOwn,
        username,
        userId,
        followerId
    } = req.body
    let response = Response(STATUS_CODE.SUCCESS, USER.UPDATED, '')

    try {
        if (userOwn !== username) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            await Promise.all([
                User.findByIdAndUpdate(userId, {
                    $addToSet: {
                        following: followerId
                    }
                }),
                User.findByIdAndUpdate(followerId, {
                    $addToSet: {
                        followers: userId
                    }
                })
            ])
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exception: Failed to follow user ', err.stack)
        response = systemError(USER.EXCEPTION)
    }
    res.send(response)
}

const unFollow = async (req, res) => {
    const {
        userOwn,
        username,
        userId,
        followerId
    } = req.body
    let response = Response(STATUS_CODE.SUCCESS, USER.UPDATED, '')

    try {
        if (userOwn !== username) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            await Promise.all([
                User.findByIdAndUpdate(userId, {
                    $pull: {
                        following: followerId
                    }
                }),
                User.findByIdAndUpdate(followerId, {
                    $pull: {
                        followers: userId
                    }
                })
            ])
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exception: Failed to follow user ', err.stack)
        response = systemError(USER.EXCEPTION)
    }
    res.send(response)
}

const getFollowersFollowing = async (req, res) => {
    const {
        userOwn,
        username
    } = req.body
    let response = Response(STATUS_CODE.SUCCESS, USER.UPDATED, '')

    try {
        if (userOwn !== username) {
            response.statusCode = STATUS_CODE.UNAUTHORIZATION
            response.message = AUTHENTICATION.UNAUTHORIZED
        } else {
            response.data = await User.find({ username: username }, { followers: 1 }).populate('followers', { full_name: 1, profile_picture: 1 }).populate('following', { full_name: 1, profile_picture: 1 })
        }
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exception: Failed to follow user ', err.stack)
        response = systemError(USER.EXCEPTION)
    }
    res.send(response)
}

const getTrendingTags = async (req, res) => {
    let response = Response(STATUS_CODE.SUCCESS, USER.SUCCESSFULL, '')

    try {
        const allTags = await Tag.find()
        console.log(allTags)
        let topTags = []
        for (let tag in allTags[0].all_tags) {
            topTags.push([tag, allTags[0].all_tags[tag]])
        }

        topTags.sort((a, b) => {
            return a[1] - b[1]
        })

        response.data = topTags.reverse().slice(0, 10)
    } catch (err) {
        logger.error(TYPE_LOG.USER, 'Exeption, cannot get tags: ', err.stack)
        response = systemError(USER.EXCEPTION)
    }
    res.send(response)
} 

module.exports = {
    signup,
    login,
    logout,
    reSendCode,
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
    getTrendingTags
}
