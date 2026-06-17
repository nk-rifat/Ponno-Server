const Product = require("../models/Product");

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
