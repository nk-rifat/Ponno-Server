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

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemsSchema],
    delivery: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      division: { type: String, required: true },
      zila: { type: String, required: true },
      upazila: { type: String, required: true },
      union: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String, default: "" },
    },
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
      default: "pending",
    },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true },
);

// Indexing
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
