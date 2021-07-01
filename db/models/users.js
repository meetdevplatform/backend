const mongoose = require('mongoose')
const { Schema } = mongoose

const friendSchema = mongoose.Schema({
    id: { type: String, ref: 'User' },
    unread_messages: { type: Number, default: 0 }
}, { _id: false })

const project = mongoose.Schema({
    id: { type: String, ref: 'Project' }
}, { _id: false })

const universityDetails = mongoose.Schema({
    name: { type: String, default: null },
    degree_type: { type: String, default: null },
    course: { type: String, default: null },
    starting_year: { type: String, default: null },
    completion_year: { type: String, default: null }
}, { _id: false })

const userSchema = new Schema({

    /* registation details */
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, unique: true },
    password: { type: String, default: '' },
    email_status: { type: String, default: 'unverified' },
    social_register: { type: Boolean, default: false },
    form_step: { type: Number, default: 1 },

    /* general information */
    profile_picture: { type: Array, default: [] },
    address: { type: String, default: '' },
    bio: { type: String, default: '' },
    specialization: { type: String, default: '' },
    skills: { type: Array, default: [] },
    interest: { type: Array, default: [] },
    is_college_student: { type: Boolean, default: null },
    followers: [{ type: String, ref: 'User' }],
    following: [{ type: String, ref: 'User' }],

    /* social profiles */
    social: { github: String, linked: String, twitter: String, website: String },

    /* university details */
    university_details: {
        type: universityDetails,
        default: {}
    },
    /* university details */
    organization_details: {
        type: { name: String, position: String, starting_year: String, completion_year: String },
        default: {}
    },

    /* messages */
    friends: [friendSchema],
    
    /* notification */
    unread_notifications: { type: Number, default: 0 },

    /* project details */
    total_project_count: { type: Number, default: 0 },
    approved_project_count: { type: Number, default: 0 },
    pending_project_count: { type: Number, default: 0 },
    liked_project: { type: Array, defualt: [project] },
    saved_project: { type: Array, default: [project] },
    code: { type: String }
},
{
    timestamps: true
}
)
module.exports = mongoose.model('User', userSchema)
