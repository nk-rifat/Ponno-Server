const express = require("express");
const {
  getAllCustomers,
  toggleBlockUser,
} = require("../controllers/adminController");
const router = express.Router();
const { verifyAccessToken, verifyAdmin } = require("../middleware/auth");

router.get("/users", verifyAccessToken, verifyAdmin, getAllCustomers);
router.patch(
  "/users/:id/block",
  verifyAccessToken,
  verifyAdmin,
  toggleBlockUser,
);

module.exports = router;
