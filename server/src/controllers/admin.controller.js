import { Schema } from "mongoose";
import { deleteImage, uploadImage } from "../config/imagekit.config.js";
import Admin from "../models/admin.model.js";
import Education from "../models/education.model.js";
import Skills from "../models/skill.model.js";
import Category from "../models/skillcategory.model.js";

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
    console.log("Before admin id called..")
    const adminId = req?.admin?._id || req?.admin?.id;
    console.log("After admin id callsed..")
    const { name } = req.body;
    const categoryName = name?.trim().toLowerCase();
    console.log("Category Name:", categoryName)
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
    console.log("Admin Found.")
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