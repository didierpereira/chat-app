import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/auth.routes.js"
import messageRoutes from "./routes/message.routes.js"
import path from "path"

import { io, server, app } from "./lib/socket.js"

const __dirname = path.resolve()

dotenv.config()

// aumentar el límite para payloads grandes (imágenes en base64)
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
)

app.use("/api/auth", authRoutes)

app.use("/api/messages", messageRoutes)

const PORT = process.env.PORT || 5001

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  })
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  connectDB()
})
