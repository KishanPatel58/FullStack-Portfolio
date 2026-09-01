import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    techStack: [{
        name: {
            String,
            required: true
        },
        image: {
            type: String
        }
    }],
    startDate: {
        type: Date,
        default: Date.now()
    },
    endDate: {
        type: Date,
        default: Date.now()
    },
    description: {
        points: [{
            type: String,
            required: true
        }]
    }
},{timestamps: true})

const Projects = model("Project", projectSchema);

export default Projects;