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

// Post api

exports.saveCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    quantity = Number(quantity);

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    const existing = cart.items.find(
      (i) => i.productId.toString() === productId,
    );

    if (existing) {
      existing.quantity = quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.json({ message: "Cart Updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart" });
  }
};

// Delete api
exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== req.params.productId,
    );

    await cart.save();
    res.json({ message: "Item remove" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove Item" });
  }
};
