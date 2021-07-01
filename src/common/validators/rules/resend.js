const signup = require('./signup')

module.exports = {
    username: signup.username,
    verifyCode: {
        in: ['body'],
        errorMessage: '"PIN code" field is missing',
        exists: true
    }
}
