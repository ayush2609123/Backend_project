import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const dbURI = `mongodb+srv://ayush2:ayush22@cluster0.ntee4.mongodb.net/${DB_NAME}`;
        console.log(`Connecting to MongoDB with URI: ${dbURI}`);
        const connectionInstance = await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`\nMongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;
