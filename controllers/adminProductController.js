const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");

// get products
exports.getAdminProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 9 } = req.query;

    const filter = {};

    if (search) {
      filter.productName = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (status === "out-of-stock") {
      filter.stock = 0;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// create product
exports.createProduct = async (req, res) => {
  try {
    const images = req.files.map((file) => file.path) || [];

    if (images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const {
      productName,
      description,
      price,
      discountPrice,
      stock,
      category,
      subCategory,
      material,
      size,
      color,
      shape,
    } = req.body;

    const product = await Product.create({
      productName,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock),
      category,
      subCategory,
      material,
      size,
      color,
      shape,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product" });
  }
};
