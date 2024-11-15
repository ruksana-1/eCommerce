const path = require('path');
const { createThumbnail } = require('./createThumbnail');

const handleImageUploads = async (images, imagePaths = [], thumbnailPaths = []) => {

    if(images && images.length > 0){
        for(const image of images){
            const imagePath = path.join('productImages', 'images', image.filename);
            const thumbnailPath = path.join('productImages', 'thumbnails', image.filename);

            imagePaths.push(imagePath);
            thumbnailPaths.push(thumbnailPath);

            const thumbnailLocation = path.join(__dirname, '../public/productImages/thumbnails/', image.filename);
            const imageLocation = path.join(__dirname, '../public/productImages/images/', image.filename);

            await createThumbnail(imageLocation, thumbnailLocation);
        }
    }

    return {imagePaths, thumbnailPaths} ;
}

module.exports = { handleImageUploads };