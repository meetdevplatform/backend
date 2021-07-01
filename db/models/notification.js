const mongoose = require('mongoose')

const { Schema } = mongoose

const notifcationSchema = new Schema({
    actor_id: { type: String, ref: 'User' },
    notifier_id: { type: String, ref: 'User', index: true },
    notification_type: { type: Number, enum: [0, 1, 2, 3, 4, 5], required: true },
    entity_type_id: { type: String, required: true, ref: 'Project' },
    read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now(), index: true }
})

/* 
 Notification Code and their meaning

 0: Approve a Project
 1: Reject a Project
 2: Project get a Like
 3. Comment on the user Project
 4. User is tagged in a Comment
 5. Added as a member to the project
*/

/*
 Entity Id to be mapped with the notification 

 Project is approved or rejected - project Id
 Project get a like or comment - project Id
 Add as a member to project - project Id
*/

module.exports = mongoose.model('Notification', notifcationSchema)
