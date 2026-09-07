import mongoose, { Schema } from "mongoose";
import validator from "validator";

const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    about: {
      profile: {
        fileId: {
          type: String,
          default: null,
        },
        url: {
          type: String,
          default: null,
        },
      },
      aboutDesc: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
      mobileNo: {
        type: String,
        maxLength: 20, // Allows country codes and formatted numbers
        default: "",
      },
      socialProfiles: [
        {
          type: Schema.Types.ObjectId,
          ref: "SocialProfile",
        },
      ],
      hobbies: [
        {
          type: Schema.Types.ObjectId,
          ref: "Hobby",
        },
      ],
      education: [
        {
          type: Schema.Types.ObjectId,
          ref: "Education",
        },
      ],
      skills: [
        {
          type: Schema.Types.ObjectId,
          ref: "Skill",
        },
      ],
      experience: [
        {
          type: Schema.Types.ObjectId,
          ref: "Experience",
        },
      ],
      projects: [
        {
          type: Schema.Types.ObjectId,
          ref: "Project",
        },
      ],
      shortDescription: {
        type: String,
        default: "",
      },
    },
    resume: {
      fileId: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
    refreshToken: {
      type: String,
      default: "",
    },
    refreshTokenExpiresIn: {
      type: Date,
      default: Date.now,
    },
    otp: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpExpiresIn: {
      type: Date,
      default: Date.now,
    },
    isForgotPasswordOtpVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;