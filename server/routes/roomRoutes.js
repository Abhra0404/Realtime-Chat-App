const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listRooms, createRoom } = require("../controllers/roomController");

const router = express.Router();

router.get("/", authMiddleware, listRooms);
router.post("/", authMiddleware, createRoom);

module.exports = router;
