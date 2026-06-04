const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
} = require("../controllers/authController");

// Register user
router.post("/register", registerUser);

// Email verification
router.get("/verify-email", verifyEmail);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

module.exports = router;
