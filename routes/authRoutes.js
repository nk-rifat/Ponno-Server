const express = require("express");
const router = express.Router();

const {
  register,
  login,
  googleAuth,
  refresh,
  me,
  logout,
} = require("../controllers/authController");

const verifyJWT = require("../middlewares/verifyJWT");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/refresh", refresh);
router.get("/me", verifyJWT, me);
router.post("/logout", logout);

module.exports = router;
