import { Schema, model } from "mongoose";

const educationSchema = new Schema(
  {
    instituteName: {
      type: String,
      required: true,
      trim: true,
    },

    study: {
      type: String,
      enum: [
        "10th",
        "12th",
        "CSE",
        "CS",
        "IT",
        "AIML",
        "Cyber Security",
      ],
      required: true,
      trim: true,
    },

    grade: {
      title: {
        type: String,
        enum: [
          "percentage",
          "cgpa",
          "gpa",
          "spi",
        ],
        required: true,
      },

      value: {
        type: Number,
        required: true,
      },
    },

    currentlyStudying: {
      type: Boolean,
      default: false,
    },

    passedYear: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    instituteLogo: {
      url: {
        type: String,
        default: null,
      },

      imageId: {
        type: String,
        default: null,
      },
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const Education =
  model(
    "Education",
    educationSchema
  );

export default Education;