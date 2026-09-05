import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { addCategory, addEducation, addSkill, deleteCategory, deleteEducation, deleteProfile, deleteSkill, findCategory, getSkills, updateEducation, updateProfile, updateSkill, uploadProfile } from "../controllers/admin.controller.js";
const adminRouter = Router()

adminRouter.use(authMiddleware)

// Upload Profile Image
adminRouter.post("/profile/upload", upload.single("profile"), uploadProfile)

// Update Profile Image
adminRouter.put("/profile/update", upload.single("profile"), updateProfile)

// Delete Profile Image
adminRouter.delete("/profile/delete", upload.single("profile"), deleteProfile)



// Add Category
adminRouter.post("/categories/add", addCategory)

// Fetch Category
adminRouter.get("/categories", findCategory)

// Delete Category
adminRouter.delete("/categories/:id/delete", deleteCategory)



// Add Skill
adminRouter.post("/skills/add", upload.single('skill'), addSkill)

// Get Skill
adminRouter.get("/skills", getSkills)

// Update Skill
adminRouter.put("/skills/:id/update", upload.single('skill'), updateSkill)

// Delete Skill
adminRouter.delete("/skills/:id/delete", deleteSkill)



// Add Education
adminRouter.post("/education/add", addEducation)

// Update Education
adminRouter.put("/education/:id/update", updateEducation)

// Add Education
adminRouter.delete("/education/:id/delete", deleteEducation)

export default adminRouter;