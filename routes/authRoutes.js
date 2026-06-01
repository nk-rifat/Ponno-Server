const express = require("express");
const router = express.Router();

const { login, refresh, me } = require("../controllers/authController");

const verifyJWT = require("../middlewares/verifyJWT");

router.post("/login", login);
router.post("/refresh", refresh);

router.get("/me", verifyJWT, me);

module.exports = router;
