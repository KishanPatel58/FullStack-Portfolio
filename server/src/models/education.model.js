import { Schema, model } from 'mongoose';

const educationSchema = new Schema({
    instituteName: {
        type: String,
        required: true
    },
    instituteLogo: {
        type: String,
        default: ""
    },
    study: {
        type: String,
        required: true,
        enum: ["12th","10th","CSE","CS","IT","AIML","Cyber Security"]
    },
    grade: {
        title: {
            type: String,
            enum: ["cgpa", "gpa", "spi", "percentage"],
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    },
    passedYear: {
        type: Date,
        default: Date.now()
    }
}, { timestamps: true })

const Education = model("Education", educationSchema);

export default Education;