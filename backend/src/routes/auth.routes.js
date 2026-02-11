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

router.put("/update-profile", protectRoute, updateProfile)
router.get("/check", protectRoute, (req, res) => {
  res.json({ user: req.user })
})

export default router
