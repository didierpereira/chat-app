import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
  const { email, fullName, password, profilePic } = req.body

  if (!email || !fullName || !password || !profilePic) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" })
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

export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // generate JWT token
    generateToken(user._id, res)
    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const logout = (_, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body
    const userId = req.user._id

    if (!profilePic) {
      return res
        .status(400)
        .json({ message: "Please provide a profile picture" })
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "chat-app/profile-pics",
      public_id: `${userId}-profile-pic`,
      overwrite: true,
    })

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    )

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
