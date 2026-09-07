import Admin from "../models/admin.model.js";
import Skills from "../models/skill.model.js";
import Experience from "../models/experience.model.js"; // Import Experience model
import Education from "../models/education.model.js";   // Import Education model
import Project from "../models/project.model.js";
import mongoose from "mongoose";
import Contact from "../models/contact.model.js";

export const getAdminDetails = async (req, res) => {
    try {
        const admin = await Admin.findOne();
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin Not Found.",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Admin Found Successfully...",
            admin: admin,
        });
    } catch (error) {
        console.log("Failed to Fetch Owner Data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to Fetch Owner Data.",
        });
    }
};

export const getSkills = async (req, res) => {
    try {
        const skills = await Skills.find().populate("category");
        return res.status(200).json({
            success: true,
            message: "Skills Found Successfully...",
            skills: skills || [],
        });
    } catch (error) {
        console.log("Failed to Fetch Skills Data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to Fetch Skills Data.",
        });
    }
};

export const getExperience = async (req, res) => {
    try {
        // Query the actual Experience model
        const experiences = await Experience.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: "Experiences Found Successfully...",
            experiences: experiences || [],
        });
    } catch (error) {
        console.log("Failed to Fetch Experience Data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to Fetch Experience Data.",
        });
    }
};

export const getEducation = async (req, res) => {
    try {
        // Query the actual Education model
        const educations = await Education.find().sort({ createdAt: 1 });
        return res.status(200).json({
            success: true,
            message: "Educations Found Successfully...",
            educations: educations || [],
        });
    } catch (error) {
        console.log("Failed to Fetch Education Data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to Fetch Education Data.",
        });
    }
};

export const getProjects = async (req, res) => {
    try {
        // Query the actual Education model
        const projects = await Project.find()
      .populate({
        path: "techStack",
        select: "name icon", 
      })
      .sort({ createdAt: 1 });
        return res.status(200).json({
            success: true,
            message: "Projects Found Successfully...",
            projects: projects || [],
        });
    } catch (error) {
        console.log("Failed to Fetch Projects Data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to Fetch Projects Data.",
        });
    }
}

export const getSelectedProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format.",
      });
    }

    // Query project and populate tech stack references
    const project = await Project.findById(id).populate({
      path: "techStack",
      select: "name icon",
    });

    if (!project) {
      return res.status.json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully.",
      project,
    });
  } catch (error) {
    console.error("Failed to fetch project details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching project details.",
    });
  }
};

export const contactMe = async (req, res) => {
    try {
        const {name, email, message} = req.body;
        if(!name || !email || !message){
            return res.status(404).json({
                success: false,
                message: "All Fields are required."
            })
        }
        const contact = await Contact.create({
            name,
            email,
            message
        })
        return res.status(201).json({
            success: true,
            message: "Your Message has been recorded..."
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to Send Message."
        })
    }
}