import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

const adminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: validator.isEmail,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    about: {
        profile: {
            fileId: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null
            }
        },
        aboutDesc: String,
        address: String,
        mobileNo: {
            type: String,
            maxLength: 10
        },
        socialProfiles: [{
            type: Schema.Types.ObjectId,
            ref: "SocialProfile"
        }],
        hobbies: [{
            type: Schema.Types.ObjectId,
            ref: "Hobby"
        }],
        education: [{
            type: Schema.Types.ObjectId,
            ref: "Education"
        }],
        skills: [{
            type: Schema.Types.ObjectId,
            ref: "Skill"
        }],
        experience: [{
            type: Schema.Types.ObjectId,
            ref: "Experience"
        }],
        projects: [{
            type: Schema.Types.ObjectId,
            ref: "Project"
        }]
    },
    refreshToken: {
        type: String,
        default: ""
    },
    refreshTokenExpiresIn: {
        type: Date,
        default: Date.now()
    },
    otp: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otpExpiresIn: {
        type: Date,
        default: Date.now()
    },
    isForgotPasswordOtpVerified: {
        type: Boolean,
        default: false
    }
},{timestamps:true})

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;