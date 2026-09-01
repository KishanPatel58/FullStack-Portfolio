import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Mongodb Connected Successfully!")
    } catch (error) {
        throw new Error("Problem to 'connect' with 'Database'...")
    }
}

export default connectDB;