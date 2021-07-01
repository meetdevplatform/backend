const { 
    login,
    logout,
    signup,
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
} = require('./userController')

const {
    addProject,
    updateProject,
    saveProject,
    likeProject,
    unlikeProject,
    comment,
    incrementView,
    deleteComment,
    getProjectForUsers,
    getUserPostedProjects,
    searchProject,

    // Admin
    changeStatus,
    test
} = require('./projectController')
const {
    verifyEmail,
    resetPassword
} = require('./emailController')

module.exports = {
    login,
    logout,
    signup,
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
    getTrendingTags,
    verifyEmail,
    resetPassword,

    // Project
    addProject,
    updateProject,
    saveProject,
    likeProject,
    unlikeProject,
    comment,
    incrementView,
    deleteComment,
    getProjectForUsers,
    getUserPostedProjects,
    searchProject,

    // Admin
    changeStatus,
    test
}
