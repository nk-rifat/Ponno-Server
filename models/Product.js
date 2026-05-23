const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: String,
    description: String,
    price: Number,
    discountPrice: Number,
    stock: Number,

    category: String,
    subCategory: String,

    material: String,
    size: String,
    color: String,
    shape: String,

    images: [String],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
