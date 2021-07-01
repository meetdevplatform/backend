const cloudinary = require('cloudinary').v2

const logger = require('./logger')
const { TYPE_LOG } = require('./constant')

const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} = require('../../../config/config')

cloudinary.config({ 
    cloud_name: CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET 
})

async function cloudinaryupload (file, filePath, name) {
    try {
        console.log(file.path)
        // const data = await cloudinary.uploader.upload(file.path)
        const data = await cloudinary.uploader.upload(file.path, { public_id: `${filePath}/${name}`, responsive_breakpoints: { create_derived: true, bytes_step: 35000, min_width: 40, max_width: 1500, max_images: 5 } })
        return data
    } catch (err) {
        logger.error(TYPE_LOG.UPLOAD, 'Exception: Failed to upload ', err.stack)
        return err
    }
}

const singleImageUpload = async (file, filePath, fileName) => {
    const res = await cloudinaryupload(file, filePath, fileName)
    return res
}

const multipleImageUpload = async (files, filePath, fileName) => {
    let i = 0
    const res = await Promise.all(
        files.map(async file => {
            let uploaded_res = await cloudinaryupload(file, filePath, `${fileName}-${i++}`)
            return uploaded_res.responsive_breakpoints[0].breakpoints
        })
    )
    return res
}

module.exports = {
    singleImageUpload,
    multipleImageUpload
}
