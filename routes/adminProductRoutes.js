const express = require("express");

const {
  getAdminProducts,
  deleteProduct,
} = require("../controllers/adminProductController");

const router = express.Router();

const { verifyAccessToken, verifyAdmin } = require("../middleware/auth");

router.get("/products", verifyAccessToken, verifyAdmin, getAdminProducts);
router.delete("/products/:id", verifyAccessToken, verifyAdmin, deleteProduct);

module.exports = router;
