const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middleware/auth");
const {
  getWishlist,
  toggleWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");

router.get("/", verifyAccessToken, getWishlist);
router.post("/toggle", verifyAccessToken, toggleWishlist);
router.delete("/", verifyAccessToken, clearWishlist);

module.exports = router;
