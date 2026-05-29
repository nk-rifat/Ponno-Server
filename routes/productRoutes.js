const express = require("express");
const router = express.Router();

const { getAllProducts, getProductById, getRelatedProducts } = require("../controllers/productController");



router.get("/related", getRelatedProducts);
router.get("/:id", getProductById);
router.get("/", getAllProducts);

module.exports = router;