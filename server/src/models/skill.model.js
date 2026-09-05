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
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Categorie"
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    },
    level: {
        type: Number,
        required: true
    }
},{timestamps: true})

const Skills = model("Skill", skillSchema);

export default Skills;