const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
  },
  changedAt: { type: Date, default: Date.now },
  note: { type: String, default: "" },
});

const orderItemsSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});
