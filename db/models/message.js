const mongoose = require('mongoose')

const { Schema } = mongoose

const messageSchema = new Schema({
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    to: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['text', 'image', 'code', 'invite', 'system'], default: 'text' },
    content: { type: String, required: true },
    read: { type: Boolean, default: false }
},
{
    timestamps: true
})

module.exports = mongoose.model('Message', messageSchema)
