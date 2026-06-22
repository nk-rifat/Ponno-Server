const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middleware/auth");

const {
  placeOrder,
  getMyOrders,
  cancelOrder,
  generateOrderReceipt,
} = require("../controllers/orderController");

router.post("/", verifyAccessToken, placeOrder);
router.get("/my-orders", verifyAccessToken, getMyOrders);
router.get("/:orderId/receipt", verifyAccessToken, generateOrderReceipt);
router.patch("/:id/cancel", verifyAccessToken, cancelOrder);

module.exports = router;
