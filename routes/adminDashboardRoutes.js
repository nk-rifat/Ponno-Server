const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
} = require("../controllers/adminDashboardController");
const {
  verifyAccessToken,
  verifyAdmin,
} = require("../middleware/auth");

router.get(
  "/dashboard/summary",
  verifyAccessToken,
  verifyAdmin,
  getDashboardSummary,
);

module.exports = router;
