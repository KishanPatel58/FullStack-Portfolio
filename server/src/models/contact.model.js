import {Schema, model} from 'mongoose';

const contactSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    message: {
        type: String
    },
    showedMessage: {
        type: Boolean,
        default: false
    },
    answer: {
        type: String,
        default: ""
    }
},{timestamps:true})

const Contact = model("Contact", contactSchema);

export default Contact;