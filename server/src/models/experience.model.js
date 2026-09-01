import { Schema, model } from 'mongoose';

const experienceSchema = new Schema({
    companyName: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    joiningDate: {
        type: Date,
        default: Date.now()
    },
    endDate: {
        type: String,
        default: Date.now()
    },
    currentlyWorkingHere: {
        type: Boolean
    },
    work: {
        points: [{
            type: String,
            required: true
        }]
    },
    companyLocation: {
        type: String,
        required: true
    }
},{timestamps: true})

const Experience = model("Experience", experienceSchema);

export default Experience;