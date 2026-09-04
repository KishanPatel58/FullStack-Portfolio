import {Schema, model} from 'mongoose';

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    }
},{timestamps: true});

const Category = model("Categorie",categorySchema);

export default Category;