module.exports = {
    userId: {
        in: ['body'],
        errorMessage: '"userId" field is missing',
        exists: true
    },
    title: {
        in: ['body'],
        errorMessage: '"title" field is missing',
        isLength: {
            errorMessage: 'Title should be minimum 10 to 250 characters',
            options: { min: 10, max: 250 }
        },
        exists: true
    },
    tagLine: {
        in: ['body'],
        errorMessage: '"tagLine" field is missing',
        isLength: {
            errorMessage: 'Tag Line should be minimum 10 to 250 characters',
            options: { min: 10, max: 250 }
        },
        exists: true
    },
    story: {
        in: ['body'],
        errorMessage: '"story" field is missing',
        isLength: {
            errorMessage: 'Story should be minimum 50 to 10000 characters',
            options: { min: 50, max: 10000 }
        },
        exists: true
    },
    codeBaseLink: {
        in: ['body'],
        matches: {
            options: [/(https?:\/\/[^\s]+)/g],
            errorMessage: 'Not a valid link.'
        },
        optional: true
    },
    category: {
        in: ['body'],
        errorMessage: '"category" field is missing',
        exists: true
    }
}
