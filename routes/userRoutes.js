const express = require("express");
const { getMe, updateMe } = require("../controllers/userController");
const { verifyAccessToken } = require("../middleware/auth");

const router = express.Router();

router.get("/me", verifyAccessToken, getMe);
router.patch("/update", verifyAccessToken, updateMe);

module.exports = router;
