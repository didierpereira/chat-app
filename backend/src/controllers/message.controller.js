import Message from "../models/message.model.js"
import User from "../models/user.model.js"
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import mongoose from "mongoose"

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password")

    // compute unread counts: number of messages from each user to the logged-in user
    const usersWithUnread = await Promise.all(
      filteredUsers.map(async (user) => {
        // let Mongoose cast ids (avoid calling ObjectId constructor directly)
        const count = await Message.countDocuments({
          senderId: user._id,
          receivedId: loggedInUserId,
          read: false,
        })
        return { ...user.toObject(), unreadCount: count }
      }),
    )

    res.status(200).json(usersWithUnread)
  } catch (error) {
    console.error("Error fetching users for sidebar:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const markMessagesRead = async (req, res) => {
  try {
    const { id: senderId } = req.params
    const myId = req.user._id

    const result = await Message.updateMany(
      { senderId: senderId, receivedId: myId, read: false },
      { $set: { read: true } },
    )

    // optionally, notify sender that messages were read
    const senderSocketId = getReceiverSocketId(senderId)
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { by: myId, from: senderId })
    }

    res.status(200).json({ modifiedCount: result.modifiedCount || result.nModified || 0 })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receivedId: userToChatId },
        { senderId: userToChatId, receivedId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receivedId } = req.params
    const { text, image } = req.body

    const senderId = req.user._id

    let imageUrl
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }

    const newMessage = new Message({
      senderId,
      receivedId,
      text,
      image: imageUrl,
      read: false,
    })

    await newMessage.save()

    const receiverSocketId = getReceiverSocketId(receivedId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage)
    }

    res.status(201).json(newMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ message: "Server error" })
  }
}
