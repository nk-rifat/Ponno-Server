const Review = require("../models/Review");
const Order = require("../models/Order");
const mongoose = require("mongoose");

exports.checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const deliveredOrder = await Order.findOne({
      userId,
      status: "delivered",
      "items.productId": productId,
    })
      .select("_id")
      .lean();

    const hasPurchased = Boolean(deliveredOrder);

    const existingReview = await Review.findOne({ productId, userId }).lean();

    return res.status(200).json({
      canReview: hasPurchased && !existingReview,
      hasPurchased,
      existingReview: existingReview || null,
    });
  } catch (error) {
    console.error("checkReviewEligibility error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
