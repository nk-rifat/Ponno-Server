const Review = require("../models/Review");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// check review eligibility
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
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// create review

exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const deliveredOrder = await Order.findOne({
      userId,
      status: "delivered",
      "items.productId": productId,
    })
      .select("_id")
      .lean();

    if (!deliveredOrder) {
      return res.status(403).json({
        message: "You can only review products you have purchased",
      });
    }

    const review = await Review.create({
      productId,
      userId,
      orderId: deliveredOrder._id,
      rating,
      comment: comment.trim(),
    });

    const populated = await review.populate("userId", "name avatar");

    return res.status(201).json({
      message: "Review submitted successfully",
      review: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "You have already reviewed this product" });
    }
    return res.status(500).json({ message: "Something went wrong" });
  }
};
