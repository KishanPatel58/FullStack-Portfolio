import { deleteImage, uploadImage } from "../config/imagekit.config.js";
import Admin from "../models/admin.model.js";
import Skills from "../models/skill.model.js";

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

export const addSkill = async (req, res) => {
    try {
        const { name, levelOfKnowledge } = req.body;
        const file = req.file;

        const adminId = req.admin?._id || req.admin?.id;

        if (!name || !levelOfKnowledge) {
            return res.status(400).json({
                success: false,
                message: "Name and level of knowledge are required.",
            });
        }

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Please login first.",
            });
        }

        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        const skillData = {
            name,
            levelOfKnowledge,
        };

        // Upload image first
        if (file) {
            const result = await uploadImage(file);

            skillData.technology = {
                imageId: result.fileId,
                url: result.url,
            };
        }

        // Create skill only after successful image upload
        const skill = await Skills.create(skillData);

        // Connect skill to admin
        admin.about.skills.push(skill._id);

        await admin.save();

        return res.status(201).json({
            success: true,
            message: "Skill added successfully.",
            skill
        });

    } catch (error) {
        console.error("Failed to add skill:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add skill.",
        });
    }
};

export const updateSkill = async (req, res) => {
    try {
        const { name, levelOfKnowledge } = req.body;

        const skillId = req.params.id;
        const file = req.file;

        const adminId = req.admin?._id || req.admin?.id;

        // Check authentication
        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Please login first.",
            });
        }

        // Validate skill ID
        if (!skillId) {
            return res.status(400).json({
                success: false,
                message: "Please select a skill to update.",
            });
        }

        // Find admin
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        // Check whether this skill belongs to the admin
        const skillBelongsToAdmin = admin.about?.skills?.some(
            (skill) => skill.toString() === skillId
        );

        if (!skillBelongsToAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this skill.",
            });
        }

        // Find skill
        const skill = await Skills.findById(skillId);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found.",
            });
        }

        // Update name
        if (name) {
            skill.name = name;
        }

        // Update level
        if (levelOfKnowledge) {
            skill.levelOfKnowledge = levelOfKnowledge;
        }

        // Update image
        if (file) {
            // 1. Upload new image first
            const result = await uploadImage(file);

            // Save old ImageKit file ID
            const oldFileId = skill.technology?.imageId;

            // 2. Update database object
            skill.technology = {
                imageId: result.fileId,
                url: result.url,
            };

            // 3. Save updated skill
            await skill.save();

            // 4. Delete old image after successful database save
            if (oldFileId) {
                try {
                    await deleteImage(oldFileId);
                } catch (deleteError) {
                    console.error(
                        "Failed to delete old skill image:",
                        deleteError
                    );
                }
            }
        } else {
            // Save other updated fields
            await skill.save();
        }

        return res.status(200).json({
            success: true,
            message: "Skill updated successfully.",
            skill,
        });

    } catch (error) {
        console.error("Failed to update skill:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update skill.",
        });
    }
};

// Delete Skill
export const deleteSkill = async (req, res) => {
    try {
        const adminId = req.admin?._id || req.admin?.id;
        const { id: skillId } = req.params;

        // Check skill ID
        if (!skillId) {
            return res.status(400).json({
                success: false,
                message: "Please select a skill to delete.",
            });
        }

        // Check authentication
        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Please login first.",
            });
        }

        // Find admin
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        // Check whether skill belongs to this admin
        const isValidSkill = admin.about?.skills?.some(
            (skill) => skill.toString() === skillId
        );

        if (!isValidSkill) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this skill.",
            });
        }

        // Find skill first because we need its image ID
        const skill = await Skills.findById(skillId);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found.",
            });
        }

        // Delete image from ImageKit if it exists
        if (skill.technology?.imageId) {
            try {
                await deleteImage(skill.technology.imageId);
            } catch (imageError) {
                console.error(
                    "Failed to delete skill image:",
                    imageError
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete skill image.",
                });
            }
        }

        // Delete skill from Skills collection
        await Skills.findByIdAndDelete(skillId);

        // Remove skill ID from admin.about.skills
        admin.about.skills = admin.about.skills.filter(
            (skill) => skill.toString() !== skillId
        );

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Skill deleted successfully.",
        });

    } catch (error) {
        console.error("Failed to delete skill:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete skill.",
        });
    }
};

// Add Education
export const addEducation = async (req, res) => {
    const {passedYear,grade,study,instituteName} = req.body;
    const file = req.file;
    try {
        
    } catch (error) {
        
    }
}