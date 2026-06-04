const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyEmail,
  loginUser,
} = require("../controllers/authController");

// Register user
router.post("/register", registerUser);

// Email verification
router.get("/verify-email", verifyEmail);

router.get("/login", loginUser);

module.exports = router;
