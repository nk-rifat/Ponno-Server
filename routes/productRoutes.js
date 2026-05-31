const express = require("express");
const router = express.Router();

const { getAllProducts, getProductById, getRelatedProducts, getFeaturedProducts } = require("../controllers/productController");


router.get("/featured", getFeaturedProducts)
router.get("/related", getRelatedProducts);
router.get("/:id", getProductById);
router.get("/", getAllProducts);

module.exports = router;