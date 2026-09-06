import { Schema } from "mongoose";
import { deleteImage, uploadImage } from "../config/imagekit.config.js";
import Admin from "../models/admin.model.js";
import Education from "../models/education.model.js";
import Skills from "../models/skill.model.js";
import Category from "../models/skillcategory.model.js";
import Experience from "../models/experience.model.js";
import fs from "fs";
import Project from "../models/project.model.js"
import TechStack from "../models/techstack.model.js";
import Hobbies from "../models/hobby.model.js";
import socialProfiles from "../models/socialprofile.model.js";

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
    return res.status(201).json({
      success: true,
      message:"Profile Added Successfully..."
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to Upload Profile."
    })
  }
}

// ============================================================
// UPDATE PROFILE IMAGE
// PUT /api/admin/profile/update
// ============================================================
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

    // Upload new image first
    const result = await uploadImage(file);

    if (!admin.about) admin.about = {};
    if (!admin.about.profile) admin.about.profile = {};

    admin.about.profile.fileId = result.fileId;
    admin.about.profile.url = result.url;
    await admin.save();

    // Delete previous image from ImageKit
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

// ============================================================
// DELETE PROFILE IMAGE
// DELETE /api/admin/profile/delete
// ============================================================
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
      level: LEVEL_VALUES[levelOfKnowledge], // number for progress UI
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

    // Ownership: skill must belong to this admin
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

    // Name
    if (name) {
      skill.name = name.trim();
    }

    // Level of knowledge + numeric level
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

    // Category
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

    // Image (optional)
    if (file) {
      const result = await uploadImage(file);
      const oldFileId = skill.technology?.imageId;

      skill.technology = {
        imageId: result.fileId,
        url: result.url,
      };

      await skill.save();

      if (oldFileId) {
        try {
          await deleteImage(oldFileId);
        } catch (deleteError) {
          console.error("Failed to delete old skill image:", deleteError);
        }
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
      try {
        await deleteImage(skill.technology.imageId);
      } catch (imageError) {
        console.error("Failed to delete skill image:", imageError);
        return res.status(500).json({
          success: false,
          message: "Failed to delete skill image.",
        });
      }
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
        message: "Please Login First."
      })
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized!"
      })
    }
    const skills = await Skills.find({ user: admin._id }).populate("category", "name") // only name (and _id by default)
      .sort({ createdAt: -1 });
    if (!skills) {
      return res.json({
        success: false,
        message: "No Skills Found."
      })
    }
    return res.status(200).json({
      success: true,
      message: "Category Fetched Successfully.",
      skills
    })
  } catch (error) {
    console.error("Failed to Fetch Categories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to Fetch Categories.",
    });
  }
}

// =========================================================
// ADD EDUCATION
// =========================================================

export const addEducation = async (req, res) => {
  try {
    // =======================================================
    // GET DATA
    // =======================================================

    const adminId =
      req.admin?._id ||
      req.admin?.id;

    const {
      instituteName,
      study,
      grade,
      currentlyStudying,
      passedYear,
      address,
    } = req.body;

    const file = req.file;

    // =======================================================
    // AUTH CHECK
    // =======================================================

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    // =======================================================
    // FIND ADMIN
    // =======================================================

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    // =======================================================
    // VALIDATE INSTITUTE NAME
    // =======================================================

    if (!instituteName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Institute name is required.",
      });
    }

    // =======================================================
    // VALIDATE STUDY
    // =======================================================

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

    // =======================================================
    // PARSE CURRENTLY STUDYING
    // =======================================================
    //
    // Frontend sends FormData, therefore boolean arrives
    // as a string:
    //
    // "true"
    // "false"
    //
    // =======================================================

    const isCurrentlyStudying =
      currentlyStudying === true ||
      currentlyStudying === "true";

    // =======================================================
    // PARSE GRADE
    // =======================================================

    let parsedGrade = grade;

    // FormData sends grade as JSON string.
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

    // =======================================================
    // VALIDATE GRADE
    // =======================================================

    const validGradeTitles = [
      "cgpa",
      "gpa",
      "spi",
      "percentage",
    ];

    const gradeTitle =
      parsedGrade?.title
        ?.toString()
        ?.trim()
        ?.toLowerCase();

    if (!gradeTitle) {
      return res.status(400).json({
        success: false,
        message: "Grade title is required.",
      });
    }

    if (!validGradeTitles.includes(gradeTitle)) {
      return res.status(400).json({
        success: false,
        message: `Invalid grade title. Allowed: ${validGradeTitles.join(", ")}`,
      });
    }

    // =======================================================
    // GRADE VALUE
    // =======================================================

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

    const gradeValue =
      Number(parsedGrade.value);

    if (Number.isNaN(gradeValue)) {
      return res.status(400).json({
        success: false,
        message: "Grade value must be a number.",
      });
    }

    // =======================================================
    // VALIDATE ADDRESS
    // =======================================================

    if (!address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required.",
      });
    }

    // =======================================================
    // PASSED YEAR LOGIC
    // =======================================================
    //
    // CURRENTLY STUDYING = TRUE
    // ---------------------------------
    // passedYear MUST be null.
    //
    // CURRENTLY STUDYING = FALSE
    // ---------------------------------
    // passedYear MUST be provided.
    //
    // =======================================================

    let parsedPassedYear = null;

    if (isCurrentlyStudying) {
      // Currently studying.
      // No passed year.
      parsedPassedYear = null;
    } else {
      // Completed education.
      if (!passedYear) {
        return res.status(400).json({
          success: false,
          message:
            "Passed year is required when currently studying is unchecked.",
        });
      }

      parsedPassedYear =
        new Date(passedYear);

      if (
        Number.isNaN(
          parsedPassedYear.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid passed year.",
        });
      }
    }

    // =======================================================
    // CREATE EDUCATION DATA
    // =======================================================

    const educationData = {
      instituteName:
        instituteName.trim(),

      // IMPORTANT:
      // This is now the actual study.
      //
      // Example:
      // IT
      // AIML
      // CSE
      study: study.trim(),

      grade: {
        title: gradeTitle,
        value: gradeValue,
      },

      currentlyStudying:
        isCurrentlyStudying,

      passedYear:
        parsedPassedYear,

      address:
        address.trim(),

      user: admin._id,
    };

    // =======================================================
    // UPLOAD LOGO
    // =======================================================

    if (file) {
      const result =
        await uploadImage(file);

      educationData.instituteLogo = {
        url: result.url,
        imageId: result.fileId,
      };
    }

    // =======================================================
    // CREATE EDUCATION
    // =======================================================

    const education =
      await Education.create(
        educationData
      );

    // =======================================================
    // ADD EDUCATION ID TO ADMIN
    // =======================================================

    if (!admin.about) {
      admin.about = {};
    }

    if (
      !Array.isArray(
        admin.about.education
      )
    ) {
      admin.about.education = [];
    }

    admin.about.education.push(
      education._id
    );

    await admin.save();

    // =======================================================
    // RESPONSE
    // =======================================================

    return res.status(201).json({
      success: true,
      message:
        "Education added successfully.",
      education,
    });

  } catch (error) {
    console.error(
      "Failed to add education:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to add education.",
    });
  }
};


// export const update education.
// =========================================================
// UPDATE EDUCATION
// =========================================================

export const updateEducation = async (
  req,
  res
) => {
  try {
    // =======================================================
    // GET DATA
    // =======================================================

    const adminId =
      req.admin?._id ||
      req.admin?.id;

    const {
      id: educationId,
    } = req.params;

    const {
      instituteName,
      study,
      grade,
      currentlyStudying,
      passedYear,
      address,
    } = req.body;

    const file = req.file;

    // =======================================================
    // CHECK EDUCATION ID
    // =======================================================

    if (!educationId) {
      return res.status(400).json({
        success: false,
        message:
          "Please select education to update.",
      });
    }

    // =======================================================
    // AUTH CHECK
    // =======================================================

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message:
          "Please login first.",
      });
    }

    // =======================================================
    // FIND ADMIN
    // =======================================================

    const admin =
      await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    // =======================================================
    // CHECK OWNERSHIP
    // =======================================================

    const isEducationOwned =
      admin.about?.education?.some(
        (id) =>
          id.toString() ===
          educationId
      );

    if (!isEducationOwned) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this education.",
      });
    }

    // =======================================================
    // FIND EDUCATION
    // =======================================================

    const education =
      await Education.findById(
        educationId
      );

    if (!education) {
      return res.status(404).json({
        success: false,
        message:
          "Education not found.",
      });
    }

    // =======================================================
    // VALID STUDIES
    // =======================================================

    const validStudies = [
      "10th",
      "12th",
      "CSE",
      "CS",
      "IT",
      "AIML",
      "Cyber Security",
    ];

    // =======================================================
    // UPDATE INSTITUTE NAME
    // =======================================================

    if (
      instituteName !== undefined
    ) {
      if (!instituteName.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Institute name cannot be empty.",
        });
      }

      education.instituteName =
        instituteName.trim();
    }

    // =======================================================
    // UPDATE STUDY
    // =======================================================

    if (study !== undefined) {
      const trimmedStudy =
        study.trim();

      if (!trimmedStudy) {
        return res.status(400).json({
          success: false,
          message:
            "Study cannot be empty.",
        });
      }

      if (
        !validStudies.includes(
          trimmedStudy
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid study. Allowed: ${validStudies.join(", ")}`,
        });
      }

      education.study =
        trimmedStudy;
    }

    // =======================================================
    // UPDATE GRADE
    // =======================================================

    if (grade !== undefined) {
      // -----------------------------------------------------
      // Parse grade
      // -----------------------------------------------------

      let parsedGrade = grade;

      if (typeof grade === "string") {
        try {
          parsedGrade =
            JSON.parse(grade);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid grade data.",
          });
        }
      }

      // -----------------------------------------------------
      // Valid grade titles
      // -----------------------------------------------------

      const validGradeTitles = [
        "cgpa",
        "gpa",
        "spi",
        "percentage",
      ];

      // -----------------------------------------------------
      // Grade title
      // -----------------------------------------------------

      if (
        parsedGrade?.title !==
        undefined
      ) {
        const gradeTitle =
          parsedGrade.title
            .toString()
            .trim()
            .toLowerCase();

        if (
          !validGradeTitles.includes(
            gradeTitle
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid grade title. Allowed: ${validGradeTitles.join(", ")}`,
          });
        }

        education.grade.title =
          gradeTitle;
      }

      // -----------------------------------------------------
      // Grade value
      // -----------------------------------------------------

      if (
        parsedGrade?.value !==
        undefined &&
        parsedGrade?.value !== ""
      ) {
        const gradeValue =
          Number(
            parsedGrade.value
          );

        if (
          Number.isNaN(
            gradeValue
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Grade value must be a number.",
          });
        }

        education.grade.value =
          gradeValue;
      }
    }

    // =======================================================
    // CURRENTLY STUDYING
    // =======================================================
    //
    // Frontend sends:
    //
    // "true"
    // "false"
    //
    // =======================================================

    let isCurrentlyStudying;

    if (
      currentlyStudying !==
      undefined
    ) {
      isCurrentlyStudying =
        currentlyStudying === true ||
        currentlyStudying ===
        "true";

      education.currentlyStudying =
        isCurrentlyStudying;
    } else {
      // If old request does not send
      // currentlyStudying, keep existing
      // value.
      isCurrentlyStudying =
        education.currentlyStudying ===
        true;
    }

    // =======================================================
    // PASSED YEAR LOGIC
    // =======================================================
    //
    // If currently studying:
    //
    //     passedYear = null
    //
    // If not currently studying:
    //
    //     passedYear is required.
    //
    // =======================================================

    if (isCurrentlyStudying) {

      // -----------------------------------------------------
      // CURRENT STUDENT
      // -----------------------------------------------------

      education.passedYear = null;

    } else {

      // -----------------------------------------------------
      // COMPLETED STUDENT
      // -----------------------------------------------------

      if (!passedYear) {
        return res.status(400).json({
          success: false,
          message:
            "Passed year is required when currently studying is unchecked.",
        });
      }

      const newPassedYear =
        new Date(passedYear);

      if (
        Number.isNaN(
          newPassedYear.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid passed year.",
        });
      }

      education.passedYear =
        newPassedYear;
    }

    // =======================================================
    // UPDATE ADDRESS
    // =======================================================

    if (
      address !== undefined
    ) {
      if (!address.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Address cannot be empty.",
        });
      }

      education.address =
        address.trim();
    }

    // =======================================================
    // UPDATE LOGO
    // =======================================================

    let oldImageId = null;

    if (file) {

      // -----------------------------------------------------
      // Save old image ID
      // -----------------------------------------------------

      oldImageId =
        education
          .instituteLogo
          ?.imageId || null;

      // -----------------------------------------------------
      // Upload new image
      // -----------------------------------------------------

      const result =
        await uploadImage(file);

      // -----------------------------------------------------
      // Replace image
      // -----------------------------------------------------

      education.instituteLogo = {
        url: result.url,
        imageId: result.fileId,
      };
    }

    // =======================================================
    // SAVE EDUCATION
    // =======================================================

    await education.save();

    // =======================================================
    // DELETE OLD IMAGE
    // =======================================================

    if (oldImageId) {
      try {
        await deleteImage(
          oldImageId
        );
      } catch (imageError) {
        console.error(
          "Failed to delete old education logo:",
          imageError
        );

        // Don't fail the entire update
        // because database update succeeded.
      }
    }

    // =======================================================
    // RESPONSE
    // =======================================================

    return res.status(200).json({
      success: true,
      message:
        "Education updated successfully.",
      education,
    });

  } catch (error) {

    console.error(
      "Failed to update education:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update education.",
    });
  }
};

// =========================
// Delete Education
// =========================

export const deleteEducation = async (req, res) => {
  try {

    // =========================
    // GET DATA
    // =========================

    const adminId =
      req.admin?._id ||
      req.admin?.id;

    const { id: educationId } =
      req.params;


    // =========================
    // CHECK EDUCATION ID
    // =========================

    if (!educationId) {
      return res.status(400).json({
        success: false,
        message:
          "Please select education to delete."
      });
    }


    // =========================
    // CHECK AUTHENTICATION
    // =========================

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message:
          "Please login first."
      });
    }


    // =========================
    // FIND ADMIN
    // =========================

    const admin =
      await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "Admin not found."
      });
    }


    // =========================
    // CHECK OWNERSHIP
    // =========================

    const isEducationOwned =
      admin.about?.education?.some(
        (id) =>
          id.toString() === educationId
      );

    if (!isEducationOwned) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this education."
      });
    }


    // =========================
    // FIND EDUCATION
    // =========================

    const education =
      await Education.findById(
        educationId
      );

    if (!education) {
      return res.status(404).json({
        success: false,
        message:
          "Education not found."
      });
    }


    // =========================
    // SAVE IMAGE ID
    // BEFORE DELETE
    // =========================

    const oldImageId =
      education.instituteLogo?.imageId ||
      null;


    // =========================
    // DELETE EDUCATION
    // FROM MONGODB
    // =========================

    await Education.findByIdAndDelete(
      educationId
    );


    // =========================
    // REMOVE EDUCATION ID
    // FROM ADMIN
    // =========================

    if (
      Array.isArray(
        admin.about?.education
      )
    ) {

      admin.about.education =
        admin.about.education.filter(
          (id) =>
            id.toString() !==
            educationId
        );

      await admin.save();
    }


    // =========================
    // DELETE IMAGEKIT IMAGE
    // =========================

    if (oldImageId) {

      try {

        await deleteImage(
          oldImageId
        );

      } catch (imageError) {

        console.error(
          "Failed to delete education logo from ImageKit:",
          imageError
        );

        /*
            We don't return an error here
            because the education itself
            was successfully deleted.
        */
      }
    }


    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      message:
        "Education deleted successfully.",
      deletedEducationId:
        educationId
    });


  } catch (error) {

    console.error(
      "Failed to delete education:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete education."
    });
  }
};

export const addCategory = async (req, res) => {
  try {
    const adminId = req?.admin?._id || req?.admin?.id;
    const { name } = req.body;
    const categoryName = name?.trim().toLowerCase();
    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Please Give Name to add Category."
      })
    }
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please Login First."
      })
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized!"
      })
    }
    const categoryExists = await Category.findOne({ name: categoryName })
    if (categoryExists) {
      return res.status(401).json({
        success: false,
        message: "Category Already Exists."
      })
    }
    const category = await Category.create({
      name: categoryName,
      user: admin._id
    })
    return res.status(201).json({
      success: true,
      message: "Category Added Successfully...",
      category
    })
  } catch (error) {
    console.error("Failed to Add Category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to Add Category.",
    });
  }
}

export const findCategory = async (req, res) => {
  try {
    const adminId = req?.admin?._id || req?.admin?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Please Login First."
      })
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized!"
      })
    }
    const categories = await Category.find({ user: admin._id });
    if (!categories) {
      return res.json({
        success: false,
        message: "No Categories Found."
      })
    }
    return res.status(200).json({
      success: true,
      message: "Category Fetched Successfully.",
      categories
    })
  } catch (error) {
    console.error("Failed to Fetch Categories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to Fetch Categories.",
    });
  }
}

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

    // Only delete category owned by this admin
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

    // Find skills linked to this category (for this admin)
    const skillsToDelete = await Skills.find({
      category: id,
      user: admin._id,
    });

    const skillIds = skillsToDelete.map((s) => s._id);

    // Delete skill images from ImageKit
    for (const skill of skillsToDelete) {
      if (skill.technology?.imageId) {
        try {
          await deleteImage(skill.technology.imageId);
        } catch (imageError) {
          console.error("Failed to delete skill image:", imageError);
        }
      }
    }

    // Delete skills from DB
    if (skillIds.length > 0) {
      await Skills.deleteMany({
        _id: { $in: skillIds },
        user: admin._id,
      });

      // Remove skill refs from admin.about.skills
      if (Array.isArray(admin.about?.skills)) {
        admin.about.skills = admin.about.skills.filter(
          (skillId) => !skillIds.some((id) => id.toString() === skillId.toString())
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
    const educations = await Education.find({ user: admin._id })
    if (!educations.length > 0) {
      return res.json({
        success: false,
        message: "No Education Found."
      })
    }
    return res.status(200).json({
      success: true,
      message: "Education Fetch Successfully.",
      educations: educations
    })
  } catch (error) {
    console.log(`Failed to Fetch Education: ${error}`)
    return res.status(500).json({
      success: false,
      message: "Failed to Fetch Education."
    })
  }
}


// Experience Controllers.

// ============================================================
// GET ALL EXPERIENCES
// GET /api/admin/experience
// ============================================================
export const getExperience = async (req, res) => {
  try {
    const adminId = req?.admin?.id || req?.admin?._id;
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Please Login First."
      })
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "You are Not Authorized."
      })
    }
    const experiences = await Experience.find({user: admin._id}).sort({ createdAt: 1 });
    if (!experiences) {
      return res.json({
        success: false,
        message: "Experiences Not Found."
      })
    }

    return res.status(200).json({
      success: true,
      count: experiences.length,
      experiences: experiences,
    });
  } catch (error) {
    console.error("Get Experience Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve experiences.",
    });
  }
};

// ============================================================
// ADD EXPERIENCE
// POST /api/admin/experience/add
// ============================================================
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

    if(!adminId){
      return res.status(400).json({
        success: false,
        message: "Please Login First."
      })
    }
    const admin = await Admin.findById(adminId)
    if(!admin){
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized."
      })
    }

    // Validation
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

    // Process logo upload with ImageKit
    let companyLogo = {
      imageId: "",
      url: "",
    };

    if (req.file) {
      const result = await uploadImage(req.file);
      companyLogo.imageId = result.fileId;
      companyLogo.url = result.url;
    }

    // Parse work points array
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
      user: admin?._id || null,
    });

    // set to admin schema.
    admin?.about?.experience?.push(newExperience._id)

    await admin.save();

    return res.status(201).json({
      success: true,
      message: "Experience record created successfully.",
      experience: newExperience,
    });
  } catch (error) {
    console.error("Add Experience Error:", error);

    // Clean temp file if an error occurred mid-upload
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add experience.",
    });
  }
};

// ============================================================
// UPDATE EXPERIENCE
// PUT /api/admin/experience/:id/update
// ============================================================
export const updateExperience = async (req, res) => {
  try {
    const adminId = req?.admin?.id || req?.admin?._id;
    const { id } = req.params;
    if(!id){
      return res.status(400).json({
        success: false,
        message: "Please Select Experience to Delete."
      })
    }

    if(!adminId){
      return res.status(400).json({
        success: false,
        message: "Please Login First."
      })
    }
    const admin = await Admin.findById(adminId)
    if(!admin){
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized."
      })
    }

    const existingExperience = await Experience.findOne({_id: id, user: admin._id});
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

    // Handle new logo upload & delete old file from ImageKit
    let companyLogo = existingExperience.companyLogo;

    if (req.file) {
      if (existingExperience.companyLogo?.imageId) {
        await deleteImage(existingExperience.companyLogo.imageId)
      }

      companyLogo = await uploadImage(req.file);
    }

    const points = parseWorkPoints(work);

    // Apply updates
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

// ============================================================
// DELETE EXPERIENCE
// DELETE /api/admin/experience/:id/delete
// ============================================================
export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req?.admin?.id || req?.admin?._id;

    if(!adminId){
      return res.status(400).json({
        success: false,
        message: "Please Login First."
      })
    }
    const admin = await Admin.findById(adminId)
    if(!admin){
      return res.status(404).json({
        success: false,
        message: "You Are not Authorized."
      })
    }

    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience record not found.",
      });
    }

    // Delete logo from ImageKit using its fileId
    if (experience.companyLogo?.imageId) {
      await deleteImage(experience.companyLogo.imageId)
    }
    admin.about.experience = admin.about.experience.filter((experienceid)=>experienceid.toString() !== id)
    await admin.save()
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



// Project Controllers.

// ============================================================
// GET ALL PROJECTS
// GET /api/admin/projects
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

    // Populated techStack references
    const projects = await Project.find({ user: admin._id })
      .populate("techStack")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve projects.",
    });
  }
};

// ============================================================
// GET SINGLE PROJECT
// GET /api/admin/projects/:id
// ============================================================
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

    // Populated techStack references for view more page
    const project = await Project.findOne({ _id: id, user: admin._id }).populate("techStack");

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

// ============================================================
// ADD PROJECT
// POST /api/admin/projects/add
// ============================================================
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

    let image = {
      imageId: "",
      url: "",
    };

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

    const populatedProject = await Project.findById(newProject._id).populate("techStack");

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

// ============================================================
// UPDATE PROJECT
// PUT /api/admin/projects/:id/update
// ============================================================
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
        await deleteImage(existingProject.image.imageId);
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

    const populatedProject = await Project.findById(existingProject._id).populate("techStack");

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

// ============================================================
// DELETE PROJECT
// DELETE /api/admin/projects/:id/delete
// ============================================================
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
      await deleteImage(project.image.imageId);
    }

    // Fixed: Do not use optional chaining on assignment target
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
// GET LOGGED-IN USER'S TECH STACKS
// GET /api/admin/techstack
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

    const techStacks = await TechStack.find({ user: admin._id }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: techStacks.length,
      techStacks,
    });
  } catch (error) {
    console.error("Get TechStack Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tech stacks.",
    });
  }
};

// ============================================================
// ADD TECH STACK FOR USER
// POST /api/admin/techstack/add
// ============================================================
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

    // Check duplicate name ONLY for this user
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

// ============================================================
// UPDATE USER'S TECH STACK
// PUT /api/admin/techstack/:id/update
// ============================================================
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
        await deleteImage(tech.icon.imageId);
      }
      tech.icon = await uploadImage(req.file);
    } else if (iconUrl !== undefined && iconUrl.trim() !== "") {
      if (tech.icon?.imageId) {
        await deleteImage(tech.icon.imageId);
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

// ============================================================
// DELETE USER'S TECH STACK (WITH SCOPED CASCADE)
// DELETE /api/admin/techstack/:id/delete
// ============================================================
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

    // 1. Delete image asset from storage
    if (tech.icon?.imageId) {
      await deleteImage(tech.icon.imageId);
    }

    // 2. Cascade delete: Pull this tech stack reference from user's projects
    await Project.updateMany(
      { user: admin._id, techStack: id },
      { $pull: { techStack: id } }
    );

    // 3. Delete document
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






// About Section.
// PUT /api/admin/profile/about-info
export const updateAboutInfo = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { name, aboutDesc, address, mobileNo } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    if (name?.trim()) admin.name = name.trim();
    if (!admin.about) admin.about = {};
    admin.about.aboutDesc = aboutDesc || "";
    admin.about.address = address || "";
    admin.about.mobileNo = mobileNo || "";

    await admin.save();
    return res.status(200).json({ success: true, message: "Profile updated", admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/hobbies/add
export const addHobby = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { name } = req.body;

    const hobby = await Hobbies.create({ name: name.trim() });
    await Admin.findByIdAndUpdate(adminId, { $push: { "about.hobbies": hobby._id } });

    return res.status(201).json({ success: true, hobby });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/hobbies/:id/delete
export const deleteHobby = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { id } = req.params;

    await Hobbies.findByIdAndDelete(id);
    await Admin.findByIdAndUpdate(adminId, { $pull: { "about.hobbies": id } });

    return res.status(200).json({ success: true, message: "Hobby deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/socials/add
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

    // If user uploaded a physical icon file
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

// DELETE /api/admin/socials/:id/delete
export const deleteSocialProfile = async (req, res) => {
  try {
    const adminId = req.admin?._id || req.admin?.id;
    const { id } = req.params;

    await socialProfiles.findByIdAndDelete(id);
    await Admin.findByIdAndUpdate(adminId, { $pull: { "about.socialProfiles": id } });

    return res.status(200).json({ success: true, message: "Social deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// GET CURRENT ADMIN PROFILE
// GET /api/admin/me
// ============================================================
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
      .populate("about.hobbies")
      .populate("about.socialProfiles");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch admin profile.",
    });
  }
};