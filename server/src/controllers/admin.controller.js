import { Schema } from "mongoose";
import { deleteImage, uploadImage } from "../config/imagekit.config.js";
import Admin from "../models/admin.model.js";
import Education from "../models/education.model.js";
import Skills from "../models/skill.model.js";
import Category from "../models/skillcategory.model.js";
import Experience from "../models/experience.model.js";
import fs from "fs";
import Project from "../models/project.model.js";
import TechStack from "../models/techstack.model.js";
import Hobbies from "../models/hobby.model.js";
import socialProfiles from "../models/socialprofile.model.js";
import Contact from "../models/contact.model.js";
import sendMail from "../config/email.config.js";

// Helper: Safely parse work points
const parseWorkPoints = (rawWork) => {
  if (!rawWork) return [];
  try {
    const parsed = typeof rawWork === "string" ? JSON.parse(rawWork) : rawWork;
    if (Array.isArray(parsed?.points)) {
      return parsed.points.map((p) => String(p).trim()).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
};

// Helper: Safely parse JSON strings from multipart/form-data
const safeJsonParse = (rawData, fallback = []) => {
  if (!rawData) return fallback;
  try {
    return typeof rawData === "string" ? JSON.parse(rawData) : rawData;
  } catch {
    return fallback;
  }
};

// ============================================================
// PROFILE IMAGE CONTROLLERS
// ============================================================

export const uploadProfile = async (req, res) => {
  const adminId = req.admin?._id || req.admin?.id;
  const file = req.file;
  try {
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image file not found.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    const result = await uploadImage(file);
    if (!admin.about) admin.about = {};
    if (!admin.about.profile) admin.about.profile = {};

    admin.about.profile.fileId = result.fileId;
    admin.about.profile.url = result.url;
    await admin.save();

    return res.status(201).json({
      success: true,
      message: "Profile Added Successfully...",
      profile: admin.about.profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to Upload Profile.",
    });
  }
};

export const updateProfile = async (req, res) => {
  const adminId = req.admin?._id || req.admin?.id;
  const file = req.file;

  try {
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image file not found.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    const oldFileId = admin.about?.profile?.fileId;
    const result = await uploadImage(file);

    if (!admin.about) admin.about = {};
    if (!admin.about.profile) admin.about.profile = {};

    admin.about.profile.fileId = result.fileId;
    admin.about.profile.url = result.url;
    await admin.save();

    if (oldFileId) {
      await deleteImage(oldFileId).catch((err) =>
        console.warn("Failed to delete old profile image:", err.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      profile: admin.about.profile,
      admin,
    });
  } catch (error) {
    console.error(`Failed to Update Profile: ${error}`);
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to Update Profile Image.",
    });
  }
};

export const deleteProfile = async (req, res) => {
  const adminId = req.admin?._id || req.admin?.id;

  try {
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

    const oldFileId = admin.about?.profile?.fileId;

    if (oldFileId) {
      await deleteImage(oldFileId).catch((err) =>
        console.warn("Failed to delete ImageKit profile file:", err.message)
      );
    }

    if (!admin.about) admin.about = {};
    if (!admin.about.profile) admin.about.profile = {};

    admin.about.profile.fileId = null;
    admin.about.profile.url = null;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Profile image deleted successfully.",
      admin,
    });
  } catch (error) {
    console.error(`Failed to Delete Profile: ${error}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to Delete Profile Image.",
    });
  }
};

// ============================================================
// SKILLS CONTROLLERS
// ============================================================

const VALID_LEVELS = [
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper-Intermediate",
  "Advanced",
  "Expert",
  "Specialist",
];

const LEVEL_VALUES = {
  Beginner: 15,
  Elementary: 30,
  Intermediate: 50,
  "Upper-Intermediate": 70,
  Advanced: 85,
  Expert: 95,
  Specialist: 100,
};

export const addSkill = async (req, res) => {
  try {
    const { name, levelOfKnowledge, category } = req.body;
    const file = req.file;
    const adminId = req.admin?._id || req.admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (!name || !levelOfKnowledge) {
      return res.status(400).json({
        success: false,
        message: "Name and level of knowledge are required.",
      });
    }

    if (!VALID_LEVELS.includes(levelOfKnowledge)) {
      return res.status(400).json({
        success: false,
        message: `Invalid level of knowledge. Allowed: ${VALID_LEVELS.join(", ")}`,
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
    }

    const skillData = {
      name: name.trim(),
      levelOfKnowledge,
      level: LEVEL_VALUES[levelOfKnowledge],
      user: admin._id,
    };

    if (category) {
      skillData.category = category;
    }

    if (file) {
      const result = await uploadImage(file);
      skillData.technology = {
        imageId: result.fileId,
        url: result.url,
      };
    }

    const skill = await Skills.create(skillData);

    if (!admin.about) admin.about = {};
    if (!Array.isArray(admin.about.skills)) admin.about.skills = [];
    admin.about.skills.push(skill._id);
    await admin.save();

    const populatedSkill = await Skills.findById(skill._id).populate(
      "category",
      "name"
    );

    return res.status(201).json({
      success: true,
      message: "Skill added successfully.",
      skill: populatedSkill,
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
    const { name, levelOfKnowledge, category } = req.body;
    const skillId = req.params.id;
    const file = req.file;
    const adminId = req.admin?._id || req.admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (!skillId) {
      return res.status(400).json({
        success: false,
        message: "Please select a skill to update.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    const skillBelongsToAdmin = admin.about?.skills?.some(
      (skill) => skill.toString() === skillId
    );

    if (!skillBelongsToAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this skill.",
      });
    }

    const skill = await Skills.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    if (name) {
      skill.name = name.trim();
    }

    if (levelOfKnowledge) {
      if (!VALID_LEVELS.includes(levelOfKnowledge)) {
        return res.status(400).json({
          success: false,
          message: `Invalid level of knowledge. Allowed: ${VALID_LEVELS.join(", ")}`,
        });
      }
      skill.levelOfKnowledge = levelOfKnowledge;
      skill.level = LEVEL_VALUES[levelOfKnowledge];
    }

    if (category !== undefined) {
      if (category === null || category === "") {
        skill.category = undefined;
      } else {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          return res.status(404).json({
            success: false,
            message: "Category not found.",
          });
        }
        skill.category = category;
      }
    }

    if (file) {
      const result = await uploadImage(file);
      const oldFileId = skill.technology?.imageId;

      skill.technology = {
        imageId: result.fileId,
        url: result.url,
      };

      await skill.save();

      if (oldFileId) {
        await deleteImage(oldFileId).catch((deleteError) =>
          console.error("Failed to delete old skill image:", deleteError)
        );
      }
    } else {
      await skill.save();
    }

    const updatedSkill = await Skills.findById(skillId).populate(
      "category",
      "name"
    );

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully.",
      skill: updatedSkill,
    });
  } catch (error) {
    console.error("Failed to update skill:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update skill.",
    });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { id: skillId } = req.params;

    if (!skillId) {
      return res.status(400).json({
        success: false,
        message: "Please select a skill to delete.",
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

    const isValidSkill = admin.about?.skills?.some(
      (skill) => skill.toString() === skillId
    );

    if (!isValidSkill) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this skill.",
      });
    }

    const skill = await Skills.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    if (skill.technology?.imageId) {
      await deleteImage(skill.technology.imageId).catch((err) =>
        console.error("Failed to delete skill image:", err)
      );
    }

    await Skills.findByIdAndDelete(skillId);

    admin.about.skills = admin.about.skills.filter(
      (id) => id.toString() !== skillId
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

export const getSkills = async (req, res) => {
  try {
    const adminId = req?.admin?._id || req?.admin?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please Login First.",
      });
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized!",
      });
    }
    const skills = await Skills.find({ user: admin._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Skills Fetched Successfully.",
      skills: skills || [],
    });
  } catch (error) {
    console.error("Failed to Fetch Skills:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to Fetch Skills.",
    });
  }
};

// ============================================================
// EDUCATION CONTROLLERS
// ============================================================

export const addEducation = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { instituteName, study, grade, currentlyStudying, passedYear, address } = req.body;
    const file = req.file;

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

    if (!instituteName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Institute name is required.",
      });
    }

    const validStudies = [
      "10th",
      "12th",
      "CSE",
      "CS",
      "IT",
      "AIML",
      "Cyber Security",
    ];

    if (!study?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Study is required.",
      });
    }

    if (!validStudies.includes(study.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid study. Allowed: ${validStudies.join(", ")}`,
      });
    }

    const isCurrentlyStudying =
      currentlyStudying === true || currentlyStudying === "true";

    let parsedGrade = grade;
    if (typeof grade === "string") {
      try {
        parsedGrade = JSON.parse(grade);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid grade data.",
        });
      }
    }

    const validGradeTitles = ["cgpa", "gpa", "spi", "percentage"];
    const gradeTitle = parsedGrade?.title?.toString()?.trim()?.toLowerCase();

    if (!gradeTitle || !validGradeTitles.includes(gradeTitle)) {
      return res.status(400).json({
        success: false,
        message: `Invalid grade title. Allowed: ${validGradeTitles.join(", ")}`,
      });
    }

    if (
      parsedGrade?.value === undefined ||
      parsedGrade?.value === null ||
      parsedGrade?.value === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Grade value is required.",
      });
    }

    const gradeValue = Number(parsedGrade.value);
    if (Number.isNaN(gradeValue)) {
      return res.status(400).json({
        success: false,
        message: "Grade value must be a number.",
      });
    }

    if (!address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required.",
      });
    }

    let parsedPassedYear = null;
    if (!isCurrentlyStudying) {
      if (!passedYear) {
        return res.status(400).json({
          success: false,
          message: "Passed year is required when currently studying is unchecked.",
        });
      }
      parsedPassedYear = new Date(passedYear);
      if (Number.isNaN(parsedPassedYear.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid passed year.",
        });
      }
    }

    const educationData = {
      instituteName: instituteName.trim(),
      study: study.trim(),
      grade: {
        title: gradeTitle,
        value: gradeValue,
      },
      currentlyStudying: isCurrentlyStudying,
      passedYear: parsedPassedYear,
      address: address.trim(),
      user: admin._id,
    };

    if (file) {
      const result = await uploadImage(file);
      educationData.instituteLogo = {
        url: result.url,
        imageId: result.fileId,
      };
    }

    const education = await Education.create(educationData);

    if (!admin.about) admin.about = {};
    if (!Array.isArray(admin.about.education)) admin.about.education = [];
    admin.about.education.push(education._id);
    await admin.save();

    return res.status(201).json({
      success: true,
      message: "Education added successfully.",
      education,
    });
  } catch (error) {
    console.error("Failed to add education:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add education.",
    });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { id: educationId } = req.params;
    const { instituteName, study, grade, currentlyStudying, passedYear, address } = req.body;
    const file = req.file;

    if (!educationId) {
      return res.status(400).json({
        success: false,
        message: "Please select education to update.",
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

    const isEducationOwned = admin.about?.education?.some(
      (id) => id.toString() === educationId
    );

    if (!isEducationOwned) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this education.",
      });
    }

    const education = await Education.findById(educationId);
    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education not found.",
      });
    }

    const validStudies = [
      "10th",
      "12th",
      "CSE",
      "CS",
      "IT",
      "AIML",
      "Cyber Security",
    ];

    if (instituteName !== undefined) {
      if (!instituteName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Institute name cannot be empty.",
        });
      }
      education.instituteName = instituteName.trim();
    }

    if (study !== undefined) {
      const trimmedStudy = study.trim();
      if (!trimmedStudy || !validStudies.includes(trimmedStudy)) {
        return res.status(400).json({
          success: false,
          message: `Invalid study. Allowed: ${validStudies.join(", ")}`,
        });
      }
      education.study = trimmedStudy;
    }

    if (grade !== undefined) {
      let parsedGrade = grade;
      if (typeof grade === "string") {
        try {
          parsedGrade = JSON.parse(grade);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Invalid grade data.",
          });
        }
      }

      const validGradeTitles = ["cgpa", "gpa", "spi", "percentage"];
      if (parsedGrade?.title !== undefined) {
        const gradeTitle = parsedGrade.title.toString().trim().toLowerCase();
        if (!validGradeTitles.includes(gradeTitle)) {
          return res.status(400).json({
            success: false,
            message: `Invalid grade title. Allowed: ${validGradeTitles.join(", ")}`,
          });
        }
        education.grade.title = gradeTitle;
      }

      if (parsedGrade?.value !== undefined && parsedGrade?.value !== "") {
        const gradeValue = Number(parsedGrade.value);
        if (Number.isNaN(gradeValue)) {
          return res.status(400).json({
            success: false,
            message: "Grade value must be a number.",
          });
        }
        education.grade.value = gradeValue;
      }
    }

    let isCurrentlyStudying;
    if (currentlyStudying !== undefined) {
      isCurrentlyStudying =
        currentlyStudying === true || currentlyStudying === "true";
      education.currentlyStudying = isCurrentlyStudying;
    } else {
      isCurrentlyStudying = education.currentlyStudying === true;
    }

    if (isCurrentlyStudying) {
      education.passedYear = null;
    } else if (passedYear !== undefined) {
      if (!passedYear) {
        return res.status(400).json({
          success: false,
          message: "Passed year is required when currently studying is unchecked.",
        });
      }
      const newPassedYear = new Date(passedYear);
      if (Number.isNaN(newPassedYear.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid passed year.",
        });
      }
      education.passedYear = newPassedYear;
    }

    if (address !== undefined) {
      if (!address.trim()) {
        return res.status(400).json({
          success: false,
          message: "Address cannot be empty.",
        });
      }
      education.address = address.trim();
    }

    let oldImageId = null;
    if (file) {
      oldImageId = education.instituteLogo?.imageId || null;
      const result = await uploadImage(file);
      education.instituteLogo = {
        url: result.url,
        imageId: result.fileId,
      };
    }

    await education.save();

    if (oldImageId) {
      await deleteImage(oldImageId).catch((imageError) =>
        console.error("Failed to delete old education logo:", imageError)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Education updated successfully.",
      education,
    });
  } catch (error) {
    console.error("Failed to update education:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update education.",
    });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { id: educationId } = req.params;

    if (!educationId) {
      return res.status(400).json({
        success: false,
        message: "Please select education to delete.",
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

    const isEducationOwned = admin.about?.education?.some(
      (id) => id.toString() === educationId
    );

    if (!isEducationOwned) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this education.",
      });
    }

    const education = await Education.findById(educationId);
    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education not found.",
      });
    }

    const oldImageId = education.instituteLogo?.imageId || null;
    await Education.findByIdAndDelete(educationId);

    if (Array.isArray(admin.about?.education)) {
      admin.about.education = admin.about.education.filter(
        (id) => id.toString() !== educationId
      );
      await admin.save();
    }

    if (oldImageId) {
      await deleteImage(oldImageId).catch((imageError) =>
        console.error("Failed to delete education logo from ImageKit:", imageError)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Education deleted successfully.",
      deletedEducationId: educationId,
    });
  } catch (error) {
    console.error("Failed to delete education:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete education.",
    });
  }
};

export const getEducations = async (req, res) => {
  try {
    const adminId = req?.admin?._id || req?.admin?.id;

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
        message: "You are not authorized.",
      });
    }

    const educations = await Education.find({ user: admin._id });

    return res.status(200).json({
      success: true,
      message: "Education Fetched Successfully.",
      educations: educations || [],
    });
  } catch (error) {
    console.error(`Failed to Fetch Education: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Failed to Fetch Education.",
    });
  }
};

// ============================================================
// CATEGORY CONTROLLERS
// ============================================================

export const addCategory = async (req, res) => {
  try {
    const adminId = req?.admin?._id || req?.admin?.id;
    const { name } = req.body;
    const categoryName = name?.trim().toLowerCase();

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Please Give Name to add Category.",
      });
    }
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized!",
      });
    }

    const categoryExists = await Category.findOne({
      name: categoryName,
      user: admin._id,
    });

    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category Already Exists.",
      });
    }

    const category = await Category.create({
      name: categoryName,
      user: admin._id,
    });

    return res.status(201).json({
      success: true,
      message: "Category Added Successfully...",
      category,
    });
  } catch (error) {
    console.error("Failed to Add Category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to Add Category.",
    });
  }
};

export const findCategory = async (req, res) => {
  try {
    const adminId = req?.admin?._id || req?.admin?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized!",
      });
    }

    const categories = await Category.find({ user: admin._id });

    return res.status(200).json({
      success: true,
      message: "Category Fetched Successfully.",
      categories: categories || [],
    });
  } catch (error) {
    console.error("Failed to Fetch Categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to Fetch Categories.",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const adminId = req?.admin?._id || req?.admin?.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please select a category to delete.",
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
        message: "You are not authorized.",
      });
    }

    const category = await Category.findOneAndDelete({
      _id: id,
      user: admin._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const skillsToDelete = await Skills.find({
      category: id,
      user: admin._id,
    });

    const skillIds = skillsToDelete.map((s) => s._id);

    for (const skill of skillsToDelete) {
      if (skill.technology?.imageId) {
        await deleteImage(skill.technology.imageId).catch((imageError) =>
          console.error("Failed to delete skill image:", imageError)
        );
      }
    }

    if (skillIds.length > 0) {
      await Skills.deleteMany({
        _id: { $in: skillIds },
        user: admin._id,
      });

      if (Array.isArray(admin.about?.skills)) {
        admin.about.skills = admin.about.skills.filter(
          (skillId) =>
            !skillIds.some((sId) => sId.toString() === skillId.toString())
        );
        await admin.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Category and related skills deleted successfully.",
      deletedSkillsCount: skillIds.length,
    });
  } catch (error) {
    console.error("Failed to Delete Category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category.",
    });
  }
};

// ============================================================
// EXPERIENCE CONTROLLERS
// ============================================================

export const getExperience = async (req, res) => {
  try {
    const adminId = req?.admin?.id || req?.admin?._id;
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are Not Authorized.",
      });
    }

    const experiences = await Experience.find({ user: admin._id }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      count: experiences.length,
      experiences: experiences || [],
    });
  } catch (error) {
    console.error("Get Experience Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve experiences.",
    });
  }
};

export const addExperience = async (req, res) => {
  try {
    const {
      companyName,
      designation,
      joiningDate,
      endDate,
      companyLocation,
      currentlyWorkingHere,
      work,
    } = req.body;

    const adminId = req?.admin?.id || req?.admin?._id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized.",
      });
    }

    if (!companyName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    if (!designation?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Designation is required.",
      });
    }

    if (!joiningDate) {
      return res.status(400).json({
        success: false,
        message: "Joining date is required.",
      });
    }

    const isCurrent =
      currentlyWorkingHere === true || currentlyWorkingHere === "true";

    if (!isCurrent && !endDate) {
      return res.status(400).json({
        success: false,
        message: "End date is required when not currently working here.",
      });
    }

    if (!companyLocation?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company location is required.",
      });
    }

    let companyLogo = {
      imageId: "",
      url: "",
    };

    if (req.file) {
      const result = await uploadImage(req.file);
      companyLogo.imageId = result.fileId;
      companyLogo.url = result.url;
    }

    const points = parseWorkPoints(work);

    const newExperience = await Experience.create({
      companyName: companyName.trim(),
      designation: designation.trim(),
      joiningDate,
      endDate: isCurrent ? "" : endDate,
      currentlyWorkingHere: isCurrent,
      companyLocation: companyLocation.trim(),
      work: { points },
      companyLogo,
      user: admin._id,
    });

    if (!admin.about) admin.about = {};
    if (!Array.isArray(admin.about.experience)) admin.about.experience = [];
    admin.about.experience.push(newExperience._id);
    await admin.save();

    return res.status(201).json({
      success: true,
      message: "Experience record created successfully.",
      experience: newExperience,
    });
  } catch (error) {
    console.error("Add Experience Error:", error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add experience.",
    });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const adminId = req?.admin?.id || req?.admin?._id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please Select Experience to Update.",
      });
    }

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized.",
      });
    }

    const existingExperience = await Experience.findOne({
      _id: id,
      user: admin._id,
    });

    if (!existingExperience) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized to update this Experience.",
      });
    }

    const {
      companyName,
      designation,
      joiningDate,
      endDate,
      companyLocation,
      currentlyWorkingHere,
      work,
    } = req.body;

    if (!companyName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    if (!designation?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Designation is required.",
      });
    }

    if (!joiningDate) {
      return res.status(400).json({
        success: false,
        message: "Joining date is required.",
      });
    }

    const isCurrent =
      currentlyWorkingHere === true || currentlyWorkingHere === "true";

    if (!isCurrent && !endDate) {
      return res.status(400).json({
        success: false,
        message: "End date is required when not currently working here.",
      });
    }

    let companyLogo = existingExperience.companyLogo;

    if (req.file) {
      if (existingExperience.companyLogo?.imageId) {
        await deleteImage(existingExperience.companyLogo.imageId).catch((err) =>
          console.warn("Could not delete old company logo:", err)
        );
      }
      const uploaded = await uploadImage(req.file);
      companyLogo = {
        imageId: uploaded.fileId,
        url: uploaded.url,
      };
    }

    const points = parseWorkPoints(work);

    existingExperience.companyName = companyName.trim();
    existingExperience.designation = designation.trim();
    existingExperience.joiningDate = joiningDate;
    existingExperience.endDate = isCurrent ? "" : endDate;
    existingExperience.currentlyWorkingHere = isCurrent;
    existingExperience.companyLocation = companyLocation?.trim() || "";
    existingExperience.work = { points };
    existingExperience.companyLogo = companyLogo;

    const updatedExperience = await existingExperience.save();

    return res.status(200).json({
      success: true,
      message: "Experience updated successfully.",
      experience: updatedExperience,
    });
  } catch (error) {
    console.error("Update Experience Error:", error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update experience.",
    });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req?.admin?.id || req?.admin?._id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized.",
      });
    }

    const experience = await Experience.findOne({ _id: id, user: admin._id });
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience record not found.",
      });
    }

    if (experience.companyLogo?.imageId) {
      await deleteImage(experience.companyLogo.imageId).catch((err) =>
        console.warn("Failed to delete experience logo:", err)
      );
    }

    if (Array.isArray(admin.about?.experience)) {
      admin.about.experience = admin.about.experience.filter(
        (expId) => expId.toString() !== id
      );
      await admin.save();
    }

    await Experience.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Experience deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Experience Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete experience.",
    });
  }
};

// ============================================================
// PROJECT CONTROLLERS
// ============================================================

export const getProjects = async (req, res) => {
  try {
    const adminId = req?.admin?.id || req?.admin?._id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized.",
      });
    }

    const projects = await Project.find({ user: admin._id })
      .populate("techStack")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects: projects || [],
    });
  } catch (error) {
    console.error("Get Projects Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve projects.",
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req?.admin?.id || req?.admin?._id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized.",
      });
    }

    const project = await Project.findOne({ _id: id, user: admin._id }).populate(
      "techStack"
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get Project By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch project details.",
    });
  }
};

export const addProject = async (req, res) => {
  try {
    const adminId = req?.admin?._id || req?.admin?.id;
    const {
      name,
      shortdesc,
      desc,
      coreFeatures,
      techStack,
      githubLink,
      publicLink,
    } = req.body || {};

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized.",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required.",
      });
    }

    if (!shortdesc?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Short description is required.",
      });
    }

    if (!desc?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Detailed description is required.",
      });
    }

    let image = { imageId: "", url: "" };
    if (req.file) {
      const result = await uploadImage(req.file);
      image = {
        imageId: result.fileId,
        url: result.url,
      };
    }

    const parsedCoreFeatures = safeJsonParse(coreFeatures, []);
    const parsedTechStack = safeJsonParse(techStack, []);

    const newProject = await Project.create({
      name: name.trim(),
      shortdesc: shortdesc.trim(),
      desc: desc.trim(),
      coreFeatures: parsedCoreFeatures,
      techStack: parsedTechStack,
      image,
      githubLink: githubLink?.trim() || "#",
      publicLink: publicLink?.trim() || "#",
      user: admin._id,
    });

    if (!admin.about) admin.about = {};
    if (!Array.isArray(admin.about.projects)) admin.about.projects = [];
    admin.about.projects.push(newProject._id);
    await admin.save();

    const populatedProject = await Project.findById(newProject._id).populate(
      "techStack"
    );

    return res.status(201).json({
      success: true,
      message: "Project added successfully.",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Add Project Error:", error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add project.",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req?.admin?.id || req?.admin?._id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized.",
      });
    }

    const existingProject = await Project.findOne({ _id: id, user: admin._id });
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "You are Not Authorized to update this Project.",
      });
    }

    const {
      name,
      shortdesc,
      desc,
      coreFeatures,
      techStack,
      githubLink,
      publicLink,
    } = req.body || {};

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required.",
      });
    }

    if (!shortdesc?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Short description is required.",
      });
    }

    if (!desc?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Detailed description is required.",
      });
    }

    let image = existingProject.image;
    if (req.file) {
      if (existingProject.image?.imageId) {
        await deleteImage(existingProject.image.imageId).catch((err) =>
          console.warn("Failed to delete previous project image:", err)
        );
      }
      const result = await uploadImage(req.file);
      image = {
        imageId: result.fileId,
        url: result.url,
      };
    }

    existingProject.name = name.trim();
    existingProject.shortdesc = shortdesc.trim();
    existingProject.desc = desc.trim();
    existingProject.coreFeatures = safeJsonParse(
      coreFeatures,
      existingProject.coreFeatures
    );
    existingProject.techStack = safeJsonParse(
      techStack,
      existingProject.techStack
    );
    existingProject.githubLink = githubLink?.trim() || "#";
    existingProject.publicLink = publicLink?.trim() || "#";
    existingProject.image = image;

    await existingProject.save();

    const populatedProject = await Project.findById(existingProject._id).populate(
      "techStack"
    );

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Update Project Error:", error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update project.",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req?.admin?.id || req?.admin?._id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized.",
      });
    }

    const project = await Project.findOne({ _id: id, user: admin._id });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized to delete this Project.",
      });
    }

    if (project.image?.imageId) {
      await deleteImage(project.image.imageId).catch((err) =>
        console.warn("Failed to delete project image:", err)
      );
    }

    if (Array.isArray(admin.about?.projects)) {
      admin.about.projects = admin.about.projects.filter(
        (projectid) => projectid.toString() !== id
      );
      await admin.save();
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Project Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete project.",
    });
  }
};

// ============================================================
// TECH STACK CONTROLLERS
// ============================================================

export const getTechStacks = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please Do Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized.",
      });
    }

    const techStacks = await TechStack.find({ user: admin._id }).sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: techStacks.length,
      techStacks: techStacks || [],
    });
  } catch (error) {
    console.error("Get TechStack Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tech stacks.",
    });
  }
};

export const addTechStack = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please Do Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized.",
      });
    }

    const { name, iconUrl } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tech stack name is required.",
      });
    }

    const existing = await TechStack.findOne({
      user: admin._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have this tech stack in your library.",
      });
    }

    let icon = { imageId: "", url: "" };
    if (req.file) {
      icon = await uploadImage(req.file);
    } else if (iconUrl?.trim()) {
      icon = {
        imageId: "",
        url: iconUrl.trim(),
      };
    }

    const newTech = await TechStack.create({
      name: name.trim(),
      icon,
      user: admin._id,
    });

    return res.status(201).json({
      success: true,
      message: "Tech stack created successfully.",
      techStack: newTech,
    });
  } catch (error) {
    console.error("Add TechStack Error:", error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add tech stack.",
    });
  }
};

export const updateTechStack = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { id } = req.params;
    const { name, iconUrl } = req.body || {};

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please Do Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized.",
      });
    }

    const tech = await TechStack.findOne({ _id: id, user: admin._id });
    if (!tech) {
      return res.status(404).json({
        success: false,
        message: "Tech stack item not found or unauthorized.",
      });
    }

    if (name?.trim()) {
      const duplicate = await TechStack.findOne({
        user: admin._id,
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Another tech stack item with this name already exists.",
        });
      }

      tech.name = name.trim();
    }

    if (req.file) {
      if (tech.icon?.imageId) {
        await deleteImage(tech.icon.imageId).catch((err) =>
          console.warn("Failed to remove old techstack image:", err)
        );
      }
      tech.icon = await uploadImage(req.file);
    } else if (iconUrl !== undefined && iconUrl.trim() !== "") {
      if (tech.icon?.imageId) {
        await deleteImage(tech.icon.imageId).catch((err) =>
          console.warn("Failed to remove old techstack image:", err)
        );
      }
      tech.icon = {
        imageId: "",
        url: iconUrl.trim(),
      };
    }

    await tech.save();

    return res.status(200).json({
      success: true,
      message: "Tech stack updated successfully.",
      techStack: tech,
    });
  } catch (error) {
    console.error("Update TechStack Error:", error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update tech stack.",
    });
  }
};

export const deleteTechStack = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { id } = req.params;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please Do Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized.",
      });
    }

    const tech = await TechStack.findOne({ _id: id, user: admin._id });
    if (!tech) {
      return res.status(404).json({
        success: false,
        message: "Tech stack item not found or unauthorized.",
      });
    }

    if (tech.icon?.imageId) {
      await deleteImage(tech.icon.imageId).catch((err) =>
        console.warn("Failed to delete tech stack icon:", err)
      );
    }

    await Project.updateMany(
      { user: admin._id, techStack: id },
      { $pull: { techStack: id } }
    );

    await TechStack.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Tech stack deleted and removed from your projects.",
    });
  } catch (error) {
    console.error("Delete TechStack Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete tech stack.",
    });
  }
};

// ============================================================
// ABOUT & PROFILE CONTROLLERS
// ============================================================

export const updateAboutInfo = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { name, aboutDesc, address, mobileNo, shortDesc } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    if (name?.trim()) admin.name = name.trim();
    if (!admin.about) admin.about = {};

    admin.about.aboutDesc = aboutDesc || "";
    admin.about.address = address || "";
    admin.about.mobileNo = mobileNo || "";
    admin.about.shortDescription = shortDesc || "";

    await admin.save();
    return res
      .status(200)
      .json({ success: true, message: "Profile updated", admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addHobby = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Hobby name is required.",
      });
    }

    const hobby = await Hobbies.create({ name: name.trim() });
    await Admin.findByIdAndUpdate(adminId, {
      $push: { "about.hobbies": hobby._id },
    });

    return res.status(201).json({ success: true, hobby });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteHobby = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { id } = req.params;

    await Hobbies.findByIdAndDelete(id);
    await Admin.findByIdAndUpdate(adminId, {
      $pull: { "about.hobbies": id },
    });

    return res.status(200).json({ success: true, message: "Hobby deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addSocialProfile = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { name, link, platformImageUrl } = req.body || {};

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (!name?.trim() || !link?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and Link are required.",
      });
    }

    let finalImageUrl = platformImageUrl?.trim() || "";

    if (req.file) {
      const result = await uploadImage(req.file);
      finalImageUrl = result.url;
    }

    const social = await socialProfiles.create({
      name: name.trim(),
      link: link.trim(),
      platformImageUrl: finalImageUrl,
    });

    await Admin.findByIdAndUpdate(adminId, {
      $push: { "about.socialProfiles": social._id },
    });

    return res.status(201).json({
      success: true,
      message: "Social profile added successfully.",
      social,
    });
  } catch (err) {
    console.error("Add Social Profile Error:", err);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to add social link.",
    });
  }
};

export const deleteSocialProfile = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { id } = req.params;

    await socialProfiles.findByIdAndDelete(id);
    await Admin.findByIdAndUpdate(adminId, {
      $pull: { "about.socialProfiles": id },
    });

    return res.status(200).json({ success: true, message: "Social deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// GET CURRENT ADMIN PROFILE (DEEP POPULATE)
// GET /api/admin/me
// ============================================================
// GET /api/admin/me
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const admin = await Admin.findById(adminId)
      .populate("about.skills")
      .populate("about.experience")
      .populate("about.education")
      .populate({
        path: "about.projects",
        populate: {
          path: "techStack",
          model: "TechStack", // Ensures TechStack model is explicitly dereferenced
        },
      })
      .populate("about.hobbies")
      .populate("about.socialProfiles");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    // Direct fallback with deep population
    let projects = admin.about?.projects || [];
    if (
      projects.length === 0 ||
      (projects[0] && !projects[0]?.name) // In case IDs failed to populate
    ) {
      projects = await Project.find({ user: admin._id }).populate({
        path: "techStack",
        model: "TechStack",
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        ...admin.toObject(),
        about: {
          ...admin.about?.toObject(),
          projects,
        },
      },
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch admin profile.",
    });
  }
};

// ============================================================
// NOTIFICATIONS & EMAIL
// ============================================================

export const generateReadNotificationEmail = ({
  userName,
  adminName,
  userMessage,
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f4f4f5;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 6px;">
                      Portfolio Update
                    </span>
                    <h1 style="margin: 16px 0 0 0; font-size: 22px; font-weight: 700; color: #18181b; letter-spacing: -0.02em;">
                      Message Seen_
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #3f3f46;">
                Hi <strong style="color: #18181b;">${userName || "there"}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #3f3f46;">
                <strong style="color: #18181b;">${adminName}</strong> has reviewed your message and will get back to you shortly.
              </p>

              ${
                userMessage
                  ? `
              <!-- User Message Preview Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-left: 3px solid #18181b; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">
                      Your Message
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #52525b; font-style: italic;">
                      "${userMessage}"
                    </p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <!-- Status Badge Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; border-radius: 10px; padding: 14px 18px;">
                <tr>
                  <td width="24" valign="middle">
                    <div style="width: 10px; height: 10px; background-color: #10b981; border-radius: 50%;"></div>
                  </td>
                  <td valign="middle">
                    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #27272a;">
                      Status: Read & Queued for Response
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 28px 0 0 0; font-size: 14px; line-height: 22px; color: #71717a;">
                Best regards,<br>
                <strong style="color: #18181b;">${adminName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 18px;">
                This is an automated notification from ${adminName}'s Portfolio. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const getNotifications = async (req, res) => {
  try {
    const adminId = req?.admin?.id || req?.admin?._id;
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized.",
      });
    }
    const notifications = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Notification Fetched Successfully.",
      notifications: notifications || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to Fetch Notifications.",
    });
  }
};

export const markAsReadNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please Select Message to Mark as Read.",
      });
    }

    const adminId = req?.admin?.id || req?.admin?._id;
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized.",
      });
    }

    const notification = await Contact.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification Not Found...",
      });
    }

    notification.showedMessage = true;
    await notification.save();

    const html = generateReadNotificationEmail({
      userName: notification?.name,
      userMessage: notification?.message,
      adminName: admin?.name,
    });

    await sendMail({
      email: notification?.email,
      html,
      text: "Confirmation Email.",
      subject: "Confirmation Email.",
    });

    return res.status(200).json({
      success: true,
      message: "Update Status...",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to Update Status.",
    });
  }
};

export const markAllAsReadNotification = async (req, res) => {
  try {
    const adminId = req?.admin?.id || req?.admin?._id;
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized.",
      });
    }

    const unreadMessages = await Contact.find({ showedMessage: false });

    await Contact.updateMany(
      { showedMessage: false },
      { $set: { showedMessage: true } }
    );

    // Send emails in parallel safely using Promise.all
    await Promise.all(
      unreadMessages.map((notification) => {
        const html = generateReadNotificationEmail({
          userName: notification?.name,
          userMessage: notification?.message,
          adminName: admin?.name,
        });
        return sendMail({
          email: notification?.email,
          html,
          text: "Confirmation Email.",
          subject: "Confirmation Email.",
        }).catch((err) => console.warn("Failed to send read receipt:", err));
      })
    );

    return res.status(200).json({
      success: true,
      message: "Marked all Message as Read.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to Update Status of all messages.",
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please Select Message to Delete.",
      });
    }

    const adminId = req?.admin?.id || req?.admin?._id;
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized.",
      });
    }

    await Contact.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Message Deleted Successfully...",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to Delete Message.",
    });
  }
};

export const replyNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please write a message to reply.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please Select Message to Reply.",
      });
    }

    const adminId = req?.admin?.id || req?.admin?._id;
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First.",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You are not Authorized.",
      });
    }

    const notification = await Contact.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not Found.",
      });
    }

    notification.answer = message.trim();
    notification.showedMessage = true;
    await notification.save();

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; color: #1f2937;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-top: 0;">
          Response from ${admin?.name}
        </h2>
        
        <p style="font-size: 14px; line-height: 22px; color: #374151;">
          Hi <strong>${notification?.name || "there"}</strong>,
        </p>

        <p style="font-size: 14px; line-height: 24px; color: #111827; margin: 16px 0;">
          ${message.trim()}
        </p>

        <!-- User Original Message Reference -->
        <div style="margin-top: 24px; padding: 14px 18px; background-color: #f3f4f6; border-left: 4px solid #111827; border-radius: 6px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #6b7280;">
            Your Original Message:
          </p>
          <p style="margin: 0; font-size: 13px; line-height: 20px; color: #4b5563; font-style: italic;">
            "${notification?.message}"
          </p>
        </div>

        <p style="margin-top: 28px; font-size: 13px; color: #6b7280;">
          Best regards,<br>
          <strong style="color: #111827;">${admin?.name}</strong>
        </p>
      </div>
    `;

    await sendMail({
      email: notification.email,
      html: emailHtml,
      text: message.trim(),
      subject: `Response regarding your message: Re: ${admin?.name}'s Portfolio`,
    });

    return res.status(200).json({
      success: true,
      message: "Reply Sent Successfully.",
    });
  } catch (error) {
    console.error("Failed to reply to notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to Reply.",
    });
  }
};

// ============================================================
// RESUME CONTROLLERS
// ============================================================

// Update in-line resume details (scoped to logged-in admin + proper dot notation)
export const updateResumeDetails = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const { name, title, email, phone, location, bio } = req.body;
    const updateQuery = {};

    if (name !== undefined) updateQuery["name"] = name.trim();
    if (email !== undefined) updateQuery["email"] = email.trim();
    if (phone !== undefined) updateQuery["about.mobileNo"] = phone.trim();
    if (location !== undefined) updateQuery["about.address"] = location.trim();
    if (bio !== undefined) updateQuery["about.aboutDesc"] = bio.trim();
    if (title !== undefined) updateQuery["about.shortDescription"] = title.trim();

    const updated = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updateQuery },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume details saved successfully.",
      admin: updated,
    });
  } catch (err) {
    console.error("Failed to update resume details:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Save published resume image URL/base64 to ImageKit
export const publishResumeImage = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
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

    const fileToUpload = req.file || req.body.imageBase64;

    if (!fileToUpload) {
      return res.status(400).json({
        success: false,
        message: "No resume image data provided.",
      });
    }

    // 1. Delete previous resume screenshot from ImageKit if it exists
    const existingFileId = admin.resume?.fileId || admin.resume?.imageId;
    if (existingFileId) {
      await deleteImage(existingFileId).catch((err) =>
        console.warn("Could not delete old resume from ImageKit:", err.message)
      );
    }

    // 2. Upload to ImageKit under the resume subfolder
    const uploadResponse = await uploadImage(fileToUpload, "/Portfolio_Admin/Resume");

    // 3. Update Admin schema
    admin.resume = {
      fileId: uploadResponse.fileId,
      imageId: uploadResponse.fileId,
      url: uploadResponse.url,
      updatedAt: new Date(),
    };

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Resume snapshot published to ImageKit successfully!",
      resume: admin.resume,
    });
  } catch (error) {
    console.error("Failed to publish resume snapshot:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to publish resume snapshot.",
    });
  }
};