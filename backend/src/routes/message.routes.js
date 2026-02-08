import { Router } from "express"
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = Router()

router.use(protectRoute)

router.get("/users", getUsersForSidebar)
router.get("/:id", getMessages)
router.post("/send/:id", sendMessage)

export default router
