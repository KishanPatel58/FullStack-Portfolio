import { Schema, model } from "mongoose";

const skillSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    levelOfKnowledge: {
        type: String,
        enum: ["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced", "Expert", "Specialist"],
        default: "Beginner",
        required: true
    },
    technology: {
        imageId: {
            type: String
        },
        url: {
            type: String
        }
    }
},{timestamps: true})

const Skills = model("Skill", skillSchema);

export default Skills;