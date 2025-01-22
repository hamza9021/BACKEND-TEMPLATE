import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URL
        );
        console.log("MONGO DB CONNECTED ", connectionInstance.connection.host);
    } catch (error) {
        console.error("MONGO DB CONNECTION ERROR ", error);
        process.exit(1);
    }
};

export default connectDb;

