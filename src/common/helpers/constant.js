module.exports = {
    AUTHENTICATION: {
        SUCCESS: 'Token is valid',
        INVALID_TOKEN: 'Invalid token. Please login again',
        TOKEN_EXPIRED: 'Your session has expired. Please login again',
        TOKEN_NOT_FOUND: 'Invalid request No Token Found. Please login again',
        EXCEPTION: 'You cannot do any actions now. Please contact our support team.',
        UNAUTHORIZED: 'Not allowed'
    },
    LOGIN: {
        SUCCESS: 'Login is successful',
        INVALID_ACCOUNT: ' This account doesn\'t exist. Please sign up',
        INVALID_EMAIL: 'You entered an invalid email address',
        UNVERIFIED_MAIL: ' Please veify your email address. Click here to resend verification code ',
        WRONG_PASS_EMAIL: 'Your username or password is wrong',
        INCOMPLETE_PROFILE: 'Your profile is not completed',
        EXCEPTION: 'Please contact our support team to help'
    },
    LOGOUT: {
        SUCCESS: 'You have successfully logged out',
        EXCEPTION: 'Oops! Something went wrong. Please contact our support team.'
    },
    SIGNUP: {
        SUCCESS: 'Your account registration is successful',
        EMAIL_EXIST: 'This email already exists. Please login.',
        RESEND_CODE: 'Verification code successfully sent to your email',
        RESEND_PWD: 'A new passwordsuccessfully sent to your email',
        USER_NOT_EXIST: 'This user does not exist',
        EXCEPTION: 'Our system is busy, kindly go back in couple hours for singing up'
    },
    VERIFY_MESSAGE: {
        SUCCESS: 'Your account verificaiton is successful.',
        INVALID_PASSCODE: 'The verification code is wrong. Please try again',
        EXPIRED_PASSCODE: 'The verification code has expired. Click here to resend one',
        EMAIL_NOT_FOUND: 'You will receive an email in your inbox if this email is registered on Platform.',
        EXCEPTION: 'It seems you cannot verify your code now, kindly try in a minute'
    },
    USER: {
        SUCCESS: 'Your request is successfull',
        UPDATED: 'Your profile updated successfully',
        NOT_EXIST: 'This user does not exist',
        EXCEPTION: 'Oops! Something went wrong. Please contact our support team.'
        
    },
    MESSAGE: {
        SEND: 'Message Sent Successfully',
        DELETED: 'Message Deleted Successfully',
        FETCH: 'Message Fetch Successfully',
        NOT_FOUND: 'No messages for this users',
        EXCEPTION: 'Oops! Something went wrong. Please contact our support team.'
    },
    NOTIFICATION: {
        SUCCESS: 'Your request is successfull',
        SEND: 'Notification Sent Successfully',
        READED: 'Mark Notification as Readed',
        FETCH: 'Notification Fetch Successfully',
        NOT_FOUND: 'No notifications for this users',
        EXCEPTION: 'Oops! Something went wrong. Please contact our support team.'
    },
    PROJECT: {
        SUCCESS: 'Your request is successfull',
        ADDED: 'Project added successfully',
        FETCH: 'Project fetch successfully',
        APPROVED: 'Project approved',
        REJECTED: 'Project rejected',
        UPDATED: 'Your project updated successfully',
        LIKED: 'Project liked successfully',
        UNLIKED: 'Project unliked successfully',
        COMMENT: 'Commented on Project',
        VIEW: 'View added for Project',
        DELETECOMMENT: 'Comment deleted successfully',
        NOT_EXIST: 'This project does not exist',
        EXCEPTION: 'Oops! Something went wrong. Please contact our support team.'
        
    },
    FILE: {
        SUCCESS: 'File Upload Successfully',
        NOT_FOUND: 'File Not Found',
        NOT_VALID: 'Not a vaild file',
        EXCEPTION: 'Our system is busy, kindly come back in couple of hours'
    },
    VERIFY_STATUS: {
        VERIFIED: 'verified',
        UNVERIFIED: 'unverified'
    },

    ADMIN: {
        SUCCESS: 'Your request is successfull',
        UPDATED: 'Your profile updated successfully',
        NOT_EXIST: 'This admin does not exist',
        EXCEPTION: 'Oops! Something went wrong. Please contact our support team.'
        
    },
    TYPE_LOG: {
        USER: 'USER',
        ADMIN: 'ADMIN'
    },
    VARIABLE: {
        USER_TOKEN_EXPIRED: 60 * 60 * 24 * 30
    }
}
