import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { addSkill, deleteProfile, updateProfile, updateSkill, uploadProfile } from "../controllers/admin.controller.js";
const adminRouter = Router()

adminRouter.use(authMiddleware)
// Upload Profile Image
adminRouter.post("/profile/upload", upload.single("profile"), uploadProfile)

// Update Profile Image
adminRouter.put("/profile/update", upload.single("profile"), updateProfile)

// Delete Profile Image
adminRouter.delete("/profile/delete", upload.single("profile"), deleteProfile)



// Add Skill
adminRouter.post("/skills/add", addSkill)

// Update Skill
adminRouter.put("/skills/skill/:id/update", updateSkill)


// Add Education

export default adminRouter;