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

// get review
exports.getProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort || "newest";

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const sortMap = {
      newest: { createdAt: -1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
    };

    const [reviews, total, summary] = await Promise.all([
      Review.find({ productId })
        .populate("userId", "name avatar")
        .sort(sortMap[sort] || sortMap.newest)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments({ productId }),
      Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    summary.forEach((s) => {
      breakdown[s._id] = s.count;
      ratingSum += s._id * s.count;
    });

    const averageRating = total > 0 ? +(ratingSum / total).toFixed(1) : 0;

    return res.status(200).json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      averageRating,
      breakdown,
    });
  } catch (error) {
    console.error("getProductReviews error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

//update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (review.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own review" });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({ message: "Comment cannot be empty" });
      }
      review.comment = comment.trim();
    }

    await review.save();
    const populated = await review.populate("userId", "name avatar");

    return res.status(200).json({
      message: "Review updated successfully",
      review: populated,
    });
  } catch (error) {
    console.error("updateReview error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.userId.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You can only delete your own review" });
    }

    await review.deleteOne();
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
