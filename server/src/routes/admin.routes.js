import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { addCategory, addEducation, addSkill, deleteEducation, deleteProfile, deleteSkill, findCategory, updateEducation, updateProfile, updateSkill, uploadProfile } from "../controllers/admin.controller.js";
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



// Add Skill
adminRouter.post("/skills/add", addSkill)

// Update Skill
adminRouter.put("/skills/skill/:id/update", updateSkill)

// Delete Skill
adminRouter.delete("/skills/skill/:id/delete", deleteSkill)



// Add Education
adminRouter.post("/education/add", addEducation)

// Update Education
adminRouter.put("/education/:id/update", updateEducation)

// Add Education
adminRouter.delete("/education/:id/delete", deleteEducation)

export default adminRouter;