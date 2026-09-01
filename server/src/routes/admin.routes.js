import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { deleteProfile, updateProfile, uploadProfile } from "../controllers/admin.controller.js";
const adminRouter = Router()

adminRouter.use(authMiddleware)
// Upload Profile Image
adminRouter.post("/profile/upload", upload.single("profile"), uploadProfile)
// Update Profile Image
adminRouter.put("/profile/update", upload.single("profile"), updateProfile)
// Delete Profile Image
adminRouter.delete("/profile/delete", upload.single("profile"), deleteProfile)
export default adminRouter;