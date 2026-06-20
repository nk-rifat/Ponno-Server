const express = require("express");
const router = express.Router();
const {
  getAdminOrders,
  advanceOrderStatus,
  adminCancelOrder,
  getAdminOrderById,
} = require("../controllers/adminOrderController");
const { verifyAccessToken, verifyAdmin } = require("../middleware/auth");

router.get("/orders", verifyAccessToken, verifyAdmin, getAdminOrders);
router.get("/orders/:id", verifyAccessToken, verifyAdmin, getAdminOrderById);
router.patch(
  "/orders/:id/status/change",
  verifyAccessToken,
  verifyAdmin,
  advanceOrderStatus,
);
router.patch(
  "/orders/:id/cancel",
  verifyAccessToken,
  verifyAdmin,
  adminCancelOrder,
);

module.exports = router;
