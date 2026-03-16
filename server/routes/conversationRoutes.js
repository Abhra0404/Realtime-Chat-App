const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  listConversations,
  getOrCreateConversation,
  getConversationMessages
} = require("../controllers/conversationController");

const router = express.Router();

router.get("/", authMiddleware, listConversations);
router.post("/with/:userId", authMiddleware, getOrCreateConversation);
router.get("/:conversationId/messages", authMiddleware, getConversationMessages);

module.exports = router;
