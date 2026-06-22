const express = require("express");
const router = express.Router();
const {
  checkReviewEligibility,
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getFeaturedReviews,
} = require("../controllers/reviewController");
const { verifyAccessToken } = require("../middleware/auth");

router.get("/reviews", getFeaturedReviews);
router.get("/:productId/reviews", getProductReviews);
router.get(
  "/:productId/reviews/eligibility",
  verifyAccessToken,
  checkReviewEligibility,
);
router.post("/:productId/reviews", verifyAccessToken, createReview);
router.put("/:productId/reviews/:reviewId", verifyAccessToken, updateReview);
router.delete("/:productId/reviews/:reviewId", verifyAccessToken, deleteReview);

module.exports = router;
