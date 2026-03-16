const User = require("../models/User");

const listUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("username email avatar isOnline lastSeenAt")
      .sort({ username: 1 });

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

module.exports = {
  listUsers
};
