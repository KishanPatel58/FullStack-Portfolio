import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { addCategory, addEducation, addExperience, addHobby, addProject, addSkill, addSocialProfile, addTechStack, deleteCategory, deleteEducation, deleteExperience, deleteHobby, deleteProfile, deleteProject, deleteSkill, deleteSocialProfile, deleteTechStack, findCategory, getAdminProfile, getEducations, getExperience, getProjectById, getProjects, getSkills, getTechStacks, updateAboutInfo, updateEducation, updateExperience, updateProfile, updateProject, updateSkill, updateTechStack, uploadProfile } from "../controllers/admin.controller.js";
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


// =========================
// EDUCATION
// =========================

// Get Education
adminRouter.get(
    "/education",
    getEducations
);

// Add Education
adminRouter.post(
    "/education/add",
    upload.single("educationLogo"),
    addEducation
);

// Update Education
adminRouter.put(
    "/education/:id/update",
    upload.single("educationLogo"),
    updateEducation
);

// Delete Education
adminRouter.delete(
    "/education/:id/delete",
    deleteEducation
);


// =========================
// Experience
// =========================

// Get Experience
adminRouter.get("/experience", getExperience)

// Add Experience
adminRouter.post("/experience/add",upload.single("companyLogo"), addExperience)

// Update Experience
adminRouter.put("/experience/:id/update",upload.single("companyLogo"), updateExperience)

// Delete Experience
adminRouter.delete("/experience/:id/delete", deleteExperience)




// Get All Projects
adminRouter.get("/projects", getProjects);

// Get Project By Id
adminRouter.get("/projects/:id", getProjectById);

// Add Project
adminRouter.post("/projects/add",upload.single("image"), addProject);

// Update Project
adminRouter.put("/projects/:id/update",upload.single("image"), updateProject);

// Delete Project
adminRouter.delete("/projects/:id/delete", deleteProject);




// =========================
// TECH STACK
// =========================

// Get logged-in user's tech stack items
adminRouter.get("/techstack", getTechStacks);

// Add a tech stack item (accepts file under 'icon' or text 'iconUrl' in body)
adminRouter.post("/techstack/add", upload.single("icon"), addTechStack);

// Update a tech stack item (accepts replacement file or new 'iconUrl')
adminRouter.put("/techstack/:id/update", upload.single("icon"), updateTechStack);

// Delete tech stack item (and cascade remove from that user's projects)
adminRouter.delete("/techstack/:id/delete", deleteTechStack);





// About Section for Admin.

// Update About Information.
adminRouter.put("/profile/about-info", updateAboutInfo)

// Get Admin Profile.
adminRouter.get("/me", getAdminProfile)

// Add Hobby.
adminRouter.post("/hobbies/add", addHobby)

// Delete Hobby.
adminRouter.delete("/hobbies/:id/delete", deleteHobby)

// Add Social.
adminRouter.post("/socials/add",upload.single("icon"), addSocialProfile)

// Delete Social.
adminRouter.delete("/socials/:id/delete", deleteSocialProfile)

export default adminRouter;