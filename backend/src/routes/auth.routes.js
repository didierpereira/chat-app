import { Router } from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { login, logout, signup, updateProfile } from "../controllers/auth.controller.js"

const router = Router()

router.post("/login", login)
router.post("/signup", signup)
router.post("/logout", logout)

router.use(protectRoute)

router.post("/update-profile", updateProfile)

export default router
