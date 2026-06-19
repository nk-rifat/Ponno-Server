const express = require("express");
const router = express.Router();
const {
  getAdminOrders,
  getAdminOrderById,
  advanceOrderStatus,
  adminCancelOrder,
} = require("../controllers/adminOrderController");
const {
  verifyAccessToken,
  verifyAdmin,
} = require("../middlewares/authMiddleware");

router.get("/orders", verifyAccessToken, verifyAdmin, getAdminOrders);
router.get("/orders/:id", verifyAccessToken, verifyAdmin, getAdminOrderById);
router.patch(
  "/orders/:id/advance",
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
