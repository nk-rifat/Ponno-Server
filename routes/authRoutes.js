const express = require("express");
const router = express.Router();

const { registerUser, verifyEmail } = require("../controllers/authController");

// Register user
router.post("/register", registerUser);

// Email verification 
router.get("/verify-email", verifyEmail);

module.exports = router;
