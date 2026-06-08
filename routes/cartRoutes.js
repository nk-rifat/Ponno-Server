const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middleware/auth");
const {
  getCart,
  saveCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

router.get("/", verifyAccessToken, getCart);
router.post("/", verifyAccessToken, saveCartItem);
router.delete("/:productId", verifyAccessToken, removeCartItem);
router.delete("/", verifyAccessToken, clearCart);

module.exports = router;
