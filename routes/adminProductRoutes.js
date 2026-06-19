const express = require("express");

const {
  getAdminProducts,
  deleteProduct,
  getProductById,
  updateProduct,
  createProduct,
} = require("../controllers/adminProductController");

const router = express.Router();

const { verifyAccessToken, verifyAdmin } = require("../middleware/auth");

router.get("/products", verifyAccessToken, verifyAdmin, getAdminProducts);
router.post(
  "/products",
  verifyAccessToken,
  verifyAdmin,
  upload.array("images", 3),
  createProduct,
);
router.put(
  "/products/:id",
  verifyAccessToken,
  verifyAdmin,
  upload.array("images", 3),
  updateProduct,
);
router.delete("/products/:id", verifyAccessToken, verifyAdmin, deleteProduct);
router.get("/products/:id", verifyAccessToken, verifyAdmin, getProductById);

module.exports = router;
