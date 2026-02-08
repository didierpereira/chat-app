import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js"
import messageRoutes from "./routes/message.routes.js"
import { connectDB } from "./lib/db.js"

dotenv.config()

const app = express()

app.use(express.json())

app.use("/api/auth", authRoutes)

app.use("/api/messages", messageRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  connectDB()
})

