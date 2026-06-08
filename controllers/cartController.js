const Cart = require("../models/Cart");
const Product = require("../models/Product");

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
    const { productId } = req.body;

    const quantity = Number(req.body.quantity);

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const safeQty = Math.max(1, Math.min(quantity, product.stock));

    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    const existing = cart.items.find(
      (i) => i.productId.toString() === productId,
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity: safeQty });
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

// Delete all cart

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.userId }, { items: [] });
    res.json({ message: "Cart clear" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
