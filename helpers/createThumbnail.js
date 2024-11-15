const sharp = require('sharp');

// Creating thumbnails
const createThumbnail = async (imagePath, thumbnailPath) => {

    try{
        await sharp(imagePath)
            .resize(60, 80)
            .toFile(thumbnailPath);

            console.log(`Thumbnail created at : ${thumbnailPath}`);
    } catch (error) {
        console.error('Error creating thumbnail : ', error);
    }
}

module.exports = { createThumbnail };