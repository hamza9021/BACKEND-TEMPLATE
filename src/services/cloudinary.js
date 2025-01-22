import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

(async function () {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
})();

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // Successfully Upload the file
        console.log(response);
        return response;
    } catch (error) {
        //remove the locally saved temporary file as the upload failed
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };
