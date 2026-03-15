const mongoose = require("mongoose");
const Message = require("../models/Message");
const Room = require("../models/Room");

const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid roomId" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const messages = await Message.find({ roomId, deletedAt: null })
      .populate("senderId", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Message.countDocuments({ roomId, deletedAt: null });

    return res.json({
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        hasMore: page * limit < total,
        total
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);

    if (!message || message.deletedAt) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    message.content = content || "";
    message.editedAt = new Date();
    await message.save();

    return res.json({ message });
  } catch (error) {
    return res.status(500).json({ message: "Failed to edit message", error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message || message.deletedAt) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    message.deletedAt = new Date();
    await message.save();

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete message", error: error.message });
  }
};

module.exports = {
  getMessages,
  editMessage,
  deleteMessage
};
