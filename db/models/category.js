const mongoose = require('mongoose')
const { Schema } = mongoose

const categorySchema = new Schema({
    all_category: { type: Object }
})

module.exports = mongoose.model('Categories', categorySchema)
