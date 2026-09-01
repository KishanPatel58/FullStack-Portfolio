import { deleteImage, uploadImage } from "../config/imagekit.config.js";
import Admin from "../models/admin.model.js";

// upload profile image
export const uploadProfile = async (req, res) => {
    const adminId = req.admin._id || req.admin.id;
    const file = req.file;
    try {
        if (!file) {
            return res.status(401).json({
                success: false,
                message: "Imagefile not found."
            })
        }
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin not found."
            })
        }
        // upload profile image
        const result = await uploadImage(file);
        admin.about.profile.fileId = result.fileId;
        admin.about.profile.url = result.url;
        await admin.save();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to Upload Profile."
        })
    }
}

export const updateProfile = async (req, res) => {
    const adminId = req.admin._id || req.admin.id;
    const file = req.file;
    try {
        if (!file) {
            return res.status(401).json({
                success: false,
                message: "Imagefile not found."
            })
        }
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin not found."
            })
        }
        // Upload new Profile to Imagekit.
        const result = await uploadImage(file);
        // Delete old Profile Image from Imagekit.
        await deleteImage(admin.about.profile.fileId);
        // update ImageId and url in admin profile.
        admin.about.profile.fileId = result.fileId;
        admin.about.profile.url = result.url;
        // Save Updated Profile
        await admin.save()
    } catch (error) {
        console.log(`Failed to Update Profile: ${error}`);
        return res.status(400).json({
            success: false,
            message: "Failed to Update Profile Image."
        })
    }
}

export const deleteProfile = async (req, res) => {
    const adminId = req.admin._id || req.admin.id;
    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin not found."
            })
        }
        // Delete Profile on Imagekit.
        await deleteImage(admin.about.profile.fileId);
        // make ProfileId and url empty in database.
        admin.about.profile.fileId = null;
        admin.about.profile.url = null;
    } catch (error) {
        console.log(`Failed to Delete Profile: ${error}`);
        return res.status(400).json({
            success: false,
            message: "Failed to Delete Profile Image."
        })
    }
}