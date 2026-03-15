const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getMessages, editMessage, deleteMessage } = require("../controllers/messageController");

const router = express.Router();

router.get("/:roomId", authMiddleware, getMessages);
router.patch("/:messageId", authMiddleware, editMessage);
router.delete("/:messageId", authMiddleware, deleteMessage);

module.exports = router;
