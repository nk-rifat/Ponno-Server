const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middleware/auth.js");

const {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getMe,
} = require("../controllers/authController");


router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", verifyAccessToken, getMe);

module.exports = router;
