import {Router} from 'express';
import { contactMe, getAdminDetails, getEducation, getExperience, getProjects, getSelectedProject, getSkills } from '../controllers/public.controller.js';

const publicRouter = Router();

publicRouter.get("/profile", getAdminDetails)
publicRouter.get("/skills", getSkills)
publicRouter.get("/experience", getExperience)
publicRouter.get("/education", getEducation)
publicRouter.get("/projects", getProjects)
publicRouter.get("/projects/:id", getSelectedProject)
publicRouter.post("/contact", contactMe)

export default publicRouter;