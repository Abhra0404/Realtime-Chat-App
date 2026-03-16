const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const User = require("../models/User");
const Conversation = require("../models/Conversation");

const getUserFromSocket = (socket) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

const onlineUsers = new Map();

const findConversation = async (conversationId, senderId, receiverId) => {
  if (!conversationId || !senderId || !receiverId) {
    return null;
  }

  return Conversation.findOne({
    _id: conversationId,
    participants: { $all: [senderId, receiverId] }
  });
};

const registerSocketHandlers = (io) => {
  io.on("connection", async (socket) => {
    const userId = getUserFromSocket(socket);

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.userId = userId;
    onlineUsers.set(userId.toString(), socket.id);

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeenAt: new Date() });
    io.emit("user_online", { userId });

    socket.on("join_conversation", ({ conversationId }) => {
      if (conversationId) {
        socket.join(conversationId);
      }
    });

    socket.on("leave_conversation", ({ conversationId }) => {
      if (conversationId) {
        socket.leave(conversationId);
      }
    });

    socket.on("typing", ({ conversationId, toUserId }) => {
      if (!conversationId || !toUserId) {
        return;
      }

      const receiverSocketId = onlineUsers.get(toUserId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { conversationId, userId });
      }
    });

    socket.on("stop_typing", ({ conversationId, toUserId }) => {
      if (!conversationId || !toUserId) {
        return;
      }

      const receiverSocketId = onlineUsers.get(toUserId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop_typing", { conversationId, userId });
      }
    });

    socket.on("send_message", async ({ conversationId, receiverId, message, type = "text", fileUrl = "" }) => {
      if (!conversationId || !receiverId || (!message && !fileUrl)) {
        return;
      }

      const conversation = await findConversation(conversationId, userId, receiverId);
      if (!conversation) {
        return;
      }

      const created = await Message.create({
        senderId: userId,
        receiverId,
        conversationId,
        content: message || "",
        type,
        fileUrl,
        readBy: [userId],
        status: "sent"
      });

      const populated = await Message.findById(created._id).populate("senderId", "username avatar");
      const receiverSocketId = onlineUsers.get(receiverId.toString());
      io.to(socket.id).emit("receive_message", populated);

      if (receiverSocketId) {
        populated.status = "delivered";
        await populated.save();
        io.to(receiverSocketId).emit("receive_message", populated);
        io.to(socket.id).emit("message_status", { messageId: populated._id.toString(), status: "delivered" });
      }

      const preview = type === "text" ? message || "" : type === "image" ? "[Image]" : "[File]";
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: preview,
        updatedAt: new Date()
      });
    });

    socket.on("message_read", async ({ conversationId, messageId }) => {
      if (!conversationId || !messageId) {
        return;
      }

      const message = await Message.findOne({
        _id: messageId,
        conversationId,
        receiverId: userId
      });

      if (!message) {
        return;
      }

      message.status = "read";
      if (!message.readBy.some((reader) => reader.toString() === userId.toString())) {
        message.readBy.push(userId);
      }
      await message.save();

      const senderSocketId = onlineUsers.get(message.senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("message_read", {
          conversationId,
          messageId: message._id.toString(),
          userId
        });
      }
    });

    socket.on("react_message", async ({ conversationId, messageId, emoji }) => {
      if (!conversationId || !messageId || !emoji) {
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        return;
      }

      message.reactions = message.reactions.filter((reaction) => reaction.userId.toString() !== userId);
      message.reactions.push({ userId, emoji });
      await message.save();

      io.to(conversationId).emit("message_reaction", {
        messageId,
        reactions: message.reactions
      });
    });

    socket.on("disconnect", async () => {
      const activeSocketId = onlineUsers.get(userId.toString());
      if (activeSocketId === socket.id) {
        onlineUsers.delete(userId.toString());
      }
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeenAt: new Date() });
      io.emit("user_offline", { userId });
    });
  });
};

module.exports = registerSocketHandlers;
