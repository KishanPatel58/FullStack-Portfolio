import { Schema, model } from "mongoose";

const hobbySchema = new Schema({
    name: String
},{timestamps:true})

const Hobbies = model("Hobby", hobbySchema);

export default Hobbies;