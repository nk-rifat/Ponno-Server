const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middleware/auth");

const {
  placeOrder,
  getMyOrders,
  cancelOrder,
} = require("../controllers/orderController");

router.post("/", verifyAccessToken, placeOrder);
router.get("/my-orders", verifyAccessToken, getMyOrders);
router.patch("/:id/cancel", protect, cancelOrder);

module.exports = router;
