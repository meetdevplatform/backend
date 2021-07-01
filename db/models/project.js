const mongoose = require('mongoose')
const { Schema } = mongoose

const teamMember = new Schema({
    id: { type: String, ref: 'User' },
    role: { type: String, required: true }
}, { _id: false })

const reply = new Schema({
    id: { type: String },
    user_id: { type: String, ref: 'User' },
    text: { type: String },
    up_vote: { type: Number, default: 0 },
    created_at: { type: Date }
}, { _id: false })

const comment = new Schema({
    id: { type: String },
    user_id: { type: String, ref: 'User' },
    text: { type: String },
    reply: [reply],
    up_vote: { type: Number, default: 0 },
    created_at: { type: Date }
}, { _id: false })

const projectSchema = new Schema({

    /* registation details */
    title: { type: String, required: true, unique: true },
    thumbnail_image: { type: String, required: true },
    tag_line: { type: String, required: true },
    story: { type: String, required: true },
    video: { type: Array, default: [] },
    code_base_link: { type: String, default: '' },
    team_member: [teamMember],
    category: { type: String, required: true, index: true },
    tags: { type: Array, default: [] },

    owner: { type: String, required: true, ref: 'User' },

    likes: [{ type: String, ref: 'User' }],
    comments: [comment],
    like_count: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    status: { type: String, default: 0, enum: [0, 1, 2] } // 0: pending, 1: approved, 2: rejected
},
{
    timestamps: true
}
)
module.exports = mongoose.model('Project', projectSchema)
