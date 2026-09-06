import mongoose from "mongoose";

const TechStackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tech stack name is required."],
      trim: true,
    },
    icon: {
      imageId: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User association is required."],
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate names for the SAME user, but allow different users to use the same name
TechStackSchema.index({ name: 1, user: 1 }, { unique: true });

const TechStack = mongoose.model("TechStack", TechStackSchema);
export default TechStack;