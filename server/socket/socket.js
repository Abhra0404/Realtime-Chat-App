const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const User = require("../models/User");

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

const registerSocketHandlers = (io) => {
  io.on("connection", async (socket) => {
    const userId = getUserFromSocket(socket);

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.userId = userId;

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeenAt: new Date() });
    io.emit("user_status", { userId, isOnline: true });

    socket.on("join_room", ({ roomId }) => {
      if (roomId) {
        socket.join(roomId);
      }
    });

    socket.on("leave_room", ({ roomId }) => {
      if (roomId) {
        socket.leave(roomId);
      }
    });

    socket.on("typing", ({ roomId }) => {
      if (roomId) {
        socket.to(roomId).emit("typing", { roomId, userId });
      }
    });

    socket.on("stop_typing", ({ roomId }) => {
      if (roomId) {
        socket.to(roomId).emit("stop_typing", { roomId, userId });
      }
    });

    socket.on("send_message", async ({ roomId, message, type = "text", fileUrl = "" }) => {
      if (!roomId || (!message && !fileUrl)) {
        return;
      }

      const created = await Message.create({
        senderId: userId,
        roomId,
        content: message || "",
        type,
        fileUrl,
        readBy: [userId]
      });

      const populated = await Message.findById(created._id).populate("senderId", "username avatar");

      io.to(roomId).emit("receive_message", populated);
    });

    socket.on("mark_read", async ({ roomId, messageId }) => {
      if (!roomId || !messageId) {
        return;
      }

      await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } });
      io.to(roomId).emit("read_receipt", { messageId, userId });
    });

    socket.on("react_message", async ({ roomId, messageId, emoji }) => {
      if (!roomId || !messageId || !emoji) {
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        return;
      }

      message.reactions = message.reactions.filter((reaction) => reaction.userId.toString() !== userId);
      message.reactions.push({ userId, emoji });
      await message.save();

      io.to(roomId).emit("message_reaction", {
        messageId,
        reactions: message.reactions
      });
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeenAt: new Date() });
      io.emit("user_status", { userId, isOnline: false });
    });
  });
};

module.exports = registerSocketHandlers;
