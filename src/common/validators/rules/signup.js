module.exports = {
    fullName: {
        in: ['body'],
        errorMessage: '"fullName" field is missing',
        exists: true
    },
    username: {
        in: ['body'],
        errorMessage: '"username" field is missing',
        exists: true
    },
    email: {
        in: ['body'],
        errorMessage: '"Email" field is missing',
        exists: true,
        isEmail: {
            errorMessage: 'Invalid email format'
        }
    },
    password: {
        in: ['body'],
        errorMessage: '"password" field is missing',
        exists: true
    }
}
