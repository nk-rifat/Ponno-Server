const Cart = require("../models/Cart");

// Get api
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId }).populate(
      "items.productId",
      "productName images price discountPrice stock",
    );

    if (!cart) return res.json({ items: [] });

    const items = cart.items
      .filter((item) => item.productId)
      .map((item) => ({
        _id: item.productId._id,
        productName: item.productId.productName,
        images: item.productId.images,
        price: item.productId.price,
        discountPrice: item.productId.discountPrice,
        stock: item.productId.stock,
        quantity: item.quantity,
      }));

    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};
