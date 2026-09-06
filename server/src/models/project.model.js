import mongoose from "mongoose";

// Sub-schema for points and paragraphs inside core feature descriptions
const FeatureDescriptionSchema = new mongoose.Schema(
  {
    desc: {
      type: String,
      default: "",
      trim: true,
    },
    points: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

// Sub-schema for Core Features (Title + Array of Description Blocks)
const CoreFeatureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: [FeatureDescriptionSchema], // Supports multiple paragraphs + points
      default: [],
    },
  },
  { _id: false }
);

// Main Project Schema
const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required."],
      trim: true,
    },
    shortdesc: {
      type: String,
      required: [true, "Short description is required."],
      trim: true,
    },
    desc: {
      type: String,
      required: [true, "Detailed description is required."],
      trim: true,
    },
    coreFeatures: {
      type: [CoreFeatureSchema],
      default: [],
    },
    image: {
      imageId: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },
    // Reference TechStack collection IDs
    techStack: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TechStack",
      },
    ],
    githubLink: {
      type: String,
      default: "#",
      trim: true,
    },
    publicLink: {
      type: String,
      default: "#",
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", ProjectSchema);
export default Project;