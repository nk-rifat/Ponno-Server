const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middleware/auth");

const { placeOrder, getMyOrders } = require("../controllers/orderController");

router.post("/", verifyAccessToken, placeOrder);
router.get("/my-orders", verifyAccessToken, getMyOrders);

module.exports = router;
