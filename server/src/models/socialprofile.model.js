import { Schema, model } from 'mongoose'
const socialProfileSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (value) {
                return value.startsWith("https://");
            },
            message: "URL must start with https://"
        }
    },
    platformImageUrl: {
        type: String,
        trim: true
    }

}, { timestamps: true })

const socialProfiles = model("SocialProfile", socialProfileSchema);

export default socialProfiles;