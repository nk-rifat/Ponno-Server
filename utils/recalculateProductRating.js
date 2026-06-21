const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");

async function recalculateProductRating(productId) {
  const result = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        ratingSum: { $sum: "$rating" },
      },
    },
  ]);

  const total = result[0]?.total || 0;
  const ratingSum = result[0]?.ratingSum || 0;
  const averageRating = total > 0 ? +(ratingSum / total).toFixed(1) : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating,
    totalReviews: total,
  });

  return { averageRating, totalReviews: total };
}

module.exports = recalculateProductRating;
