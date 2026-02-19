import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    // Do not exit the process in development — allow the server to run
    // so socket functionality can be tested even if the DB is unreachable.
    return false
  }
}
