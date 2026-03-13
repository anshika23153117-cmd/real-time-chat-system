const express = require("express");
const router = express.Router();
const { getUsers } = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

// Get all users except logged-in user
router.get("/", authMiddleware, getUsers);

module.exports = router;