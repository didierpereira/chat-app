import { Router } from "express"
import {
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = Router()

router.post("/login", login)
router.post("/signup", signup)
router.post("/logout", logout)

router.use(protectRoute)

router.post("/update-profile", updateProfile)
router.get("/check", (req, res) => {
  res.json({ user: req.user })
})

export default router
