const Product = require("../models/Product");

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { category, price, sort, page = 1, limit = 9 } = req.query;

    let filter = {};
    let sortOption = {};

    //category filter
    if (category) {
      filter.category = category;
    }

    //price filter
    if (price) {
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
    }

    // sorting
    if (sort === "price_asc") sortOption.price = 1;
    if (sort === "price_desc") sortOption.price = -1;
    if (sort === "newest") sortOption.createdAt = -1;
    if (sort === "rating") sortOption.rating = -1;

    // PAGINATION LOGIC
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById
};
