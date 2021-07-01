/* eslint-disable new-cap */
const passport = require('passport')
const Google = require('passport-google-oauth20')
const GitHubStrategy = require('passport-github2').Strategy
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const { User } = require('../../../db/models')
const { genJWTToken, encryptString, encryptObject, userProfilePicture } = require('./auth')
const USER_TOKEN_EXPIRED = 60 * 60 * 24 * 30 // expires in 30 days
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALL_BACKURL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALL_BACKURL, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_CALL_BACKURL } = require('../../../config/config')
passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((id, done) => {
    User.findOne({ id }).then(user => {
        const userDetails = {
            id: user._id,
            fullName: user.full_name,
            profilePicture: user.profile_picture,
            friends: user.friends
        }
        done(null, userDetails)
    }).catch(err => console.log(err))
})

passport.use('google', new Google({
    callbackURL: GOOGLE_CALL_BACKURL,
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ email: profile._json.email }).then(async (user) => {
        if (user) {
            const token = await genJWTToken(`${user._id}`, USER_TOKEN_EXPIRED)
            const userDetails = {
                token: encryptString(token),
                user: encryptObject({
                    id: user._id,
                    fullName: user.full_name,
                    profilePicture: user.profile_picture,
                    friends: user.friends
                })
            }
            return done(null, userDetails)
        } else {
            const db = {
                full_name: profile.displayName,
                email: profile._json.email,
                profile_picture: userProfilePicture[profile.displayName.split(' ')[0][0].toLocaleUpperCase()],
                social_register: true,
                email_status: 'verified'
            }
            User.create(db)
                .then(async (result) => {
                    const token = await genJWTToken(`${result._id}`, USER_TOKEN_EXPIRED)
                    const user = {
                        token: encryptString(token),
                        user: encryptObject({
                            id: result._id,
                            fullName: profile.displayName,
                            profilePicture: profile._json.picture,
                            friends: []
                        })
                    }
                    return done(null, user)
                })
        }
    })
        .catch(err => {
            console.log(err)
        })
})
)

passport.use('github', new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALL_BACKURL,
    scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
    if (profile._json.email === null) {
        profile._json.email = profile.emails[0].value
    }
    // return done(profile)
    User.findOne({ email: profile._json.email }).then(async (user) => {
        if (user) {
            const token = await genJWTToken(`${user._id}`, USER_TOKEN_EXPIRED)
            const userDetails = {
                token: encryptString(token),
                user: encryptObject({
                    id: user._id,
                    fullName: user.full_name,
                    profilePicture: user.profile_picture,
                    friends: user.friends
                })
            }
            return done(null, userDetails)
        } else {
            const db = {
                full_name: profile.displayName,
                email: profile._json.email,
                profile_picture: userProfilePicture[profile.displayName.split(' ')[0][0].toLocaleUpperCase()],
                social_register: true,
                email_status: 'verified'
            }
            User.create(db)
                .then(async (result) => {
                    const token = await genJWTToken(`${result._id}`, USER_TOKEN_EXPIRED)
                    const user = {
                        token: encryptString(token),
                        user: encryptObject({
                            id: result._id,
                            fullName: profile.displayName,
                            profilePicture: profile._json.picture,
                            friends: []
                        })
                    }
                    return done(null, user)
                })
        }
    })
        .catch(err => {
            console.log(err)
        })
}
))

passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_CLIENT_ID,
    clientSecret: LINKEDIN_CLIENT_SECRET,
    callbackURL: LINKEDIN_CALL_BACKURL,
    scope: ['r_emailaddress', 'r_liteprofile']
}, (token, tokenSecret, profile, done) => {
    console.log(profile)
    return done(null, null)
}
))
