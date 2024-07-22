import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGODB_URL, {
            dbName: "pinterest",
            useNewUrlParser: true,
        })
        console.log("DB Connected ....");
    } catch (error) {
        console.log(error);
    }
}