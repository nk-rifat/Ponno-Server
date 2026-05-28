const Product = require("../models/Product");

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }
    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

module.exports = {
  getAllProducts,
};
