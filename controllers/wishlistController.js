const Wishlist = require("../models/Wishlist");

// Get api
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.userId }).populate(
      "items",
      "productName images price discountPrice stock",
    );

    if (!wishlist) return res.json({ items: [] });

    const items = wishlist.items.map((p) => ({
      _id: p._id,
      productName: p.productName,
      images: p.images,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
    }));

    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};
