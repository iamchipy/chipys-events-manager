// Imports
import mongoose from "mongoose";

// Basic DB connection object done with Async since Mongo is all Async
const connectDB = async () => {
    // try catch to handle errors ourself
    try {
        // connection var *that uses ENV info
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected to: ${conn.connection.host}`)
    } catch (error){
        // log error and exit if DB connection fails
        console.log(`DBError: ${error.message}`)
        process.exit(3)
    }
}

export default connectDB