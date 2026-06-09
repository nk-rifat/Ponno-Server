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

// Post, toggle wishlist

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId: req.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, items: [] });
    }

    const index = wishlist.items.findIndex((id) => id.toString() === productId);

    if (index !== -1) {
      wishlist.items.splice(index, 1); //remove
    } else {
      wishlist.items.push(productId); // add
    }

    await wishlist.save();
    res.json({ message: "Wishlist updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update wishlist" });
  }
};

// All delete

exports.clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate({ userId: req.userId }, { items: [] });
    res.json({ message: "Wishlist cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear wishlist" });
  }
};
