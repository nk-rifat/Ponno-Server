const express = require("express");
const router = express.Router();
const {verifyAccessToken} = require("../middleware/auth")

const { placeOrder } = require("../controllers/orderController");

router.post("/", verifyAccessToken, placeOrder);

module.exports = router;
