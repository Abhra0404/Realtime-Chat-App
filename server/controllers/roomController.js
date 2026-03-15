const Room = require("../models/Room");

const listRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.id })
      .populate("members", "username avatar isOnline")
      .sort({ updatedAt: -1 });

    return res.json({ rooms });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch rooms", error: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name, memberIds = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const uniqueMembers = [...new Set([req.user.id, ...memberIds])];

    const room = await Room.create({
      name: name.trim(),
      members: uniqueMembers,
      createdBy: req.user.id
    });

    const populatedRoom = await Room.findById(room._id).populate("members", "username avatar isOnline");

    return res.status(201).json({ room: populatedRoom });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create room", error: error.message });
  }
};

module.exports = {
  listRooms,
  createRoom
};
