import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"

export const signup = async (req, res) => {
  const { email, fullName, password, profilePic } = req.body

  if(!email || !fullName || !password || !profilePic) {
    return  res.status(400).json({ message: "Please provide all required fields" })
  }

  try {
    // hash password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" })
    }

    const user = await User.findOne({ email })

    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      email: email,
      fullName: fullName,
      password: hashedPassword,
      profilePic: profilePic,
    })

    if (newUser) {
      // generate JWT token

      generateToken(newUser._id, res)
      await newUser.save()
      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      })
    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {}
}

export const login = (req, res) => {
  res.send("Login route")
}

export const logout = (req, res) => {
  res.send("Logout route")
}
