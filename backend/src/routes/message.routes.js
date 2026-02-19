import { Router } from "express"
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  markMessagesRead,
} from "../controllers/message.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = Router()

router.get("/users", protectRoute, getUsersForSidebar)
router.get("/:id", protectRoute, getMessages)
router.post("/send/:id", protectRoute, sendMessage)
router.post("/mark-read/:id", protectRoute, markMessagesRead)

export default router
