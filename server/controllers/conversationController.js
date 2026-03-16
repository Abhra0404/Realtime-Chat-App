const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getOtherParticipant = (conversation, currentUserId) =>
  conversation.participants.find((participant) => participant._id.toString() !== currentUserId);

const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "username avatar isOnline lastSeenAt")
      .sort({ updatedAt: -1 });

    const withUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          receiverId: req.user.id,
          status: { $ne: "read" },
          deletedAt: null
        });

        return {
          ...conversation.toObject(),
          unreadCount,
          otherParticipant: getOtherParticipant(conversation, req.user.id) || null
        };
      })
    );

    return res.json({ conversations: withUnread });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch conversations", error: error.message });
  }
};

const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot create conversation with yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] },
      $expr: { $eq: [{ $size: "$participants" }, 2] }
    }).populate("participants", "username avatar isOnline lastSeenAt");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, userId]
      });

      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "username avatar isOnline lastSeenAt"
      );
    }

    return res.status(201).json({
      conversation: {
        ...conversation.toObject(),
        unreadCount: 0,
        otherParticipant: getOtherParticipant(conversation, req.user.id) || null
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create conversation", error: error.message });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId, deletedAt: null })
      .populate("senderId", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId, deletedAt: null });

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

module.exports = {
  listConversations,
  getOrCreateConversation,
  getConversationMessages
};
