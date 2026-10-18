const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
            console.log('[Dev Notice] Cloudinary credentials not set in .env. Using appropriate fallback URL for upload.');
            const isVideo = file?.mimetype?.startsWith('video/') || file?.name?.match(/\.(mp4|mov|avi|mkv|webm)$/i);
            const isJson = file?.mimetype?.includes('json') || file?.name?.match(/\.json$/i);
            if (isVideo) {
                return {
                    secure_url: '/sample-video.mp4',
                    duration: '10:00'
                };
            }
            if (isJson) {
                return {
                    secure_url: null
                };
            }
            return {
                secure_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee'
            };
        }
        const options = { folder };
        if (height) options.height = height;
        if (quality) options.quality = quality;

        options.resource_type = 'auto';
        return await cloudinary.uploader.upload(file.tempFilePath, options);
    }
    catch (error) {
        console.log("Error while uploading image, using fallback URL:", error.message);
        const isVideo = file?.mimetype?.startsWith('video/') || file?.name?.match(/\.(mp4|mov|avi|mkv|webm)$/i);
        if (isVideo) {
            return {
                secure_url: '/sample-video.mp4',
                duration: '10:00'
            };
        }
        return {
            secure_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee'
        };
    }
}



// Function to delete a resource by public ID
exports.deleteResourceFromCloudinary = async (url) => {
    if (!url) return;

    try {
        const result = await cloudinary.uploader.destroy(url);
        console.log(`Deleted resource with public ID: ${url}`);
        console.log('Delete Resourse result = ', result)
        return result;
    } catch (error) {
        console.error(`Error deleting resource with public ID ${url}:`, error);
        throw error;
    }
};