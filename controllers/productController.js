const Product = require("../models/Product");

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const { category, price } = req.query;

    let filter = {};

    //category filter
    if (category) {
      filter.category = category;
    }

    //price filter
    if (price.includes("+")) {
      const min = price.replace("+", "");

      filter.price = {
        $gte: Number(min),
      };
    } else {
      const [min, max] = price.split("-");

      filter.price = {
        $gte: Number(min),
        $lte: Number(max),
      };
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
