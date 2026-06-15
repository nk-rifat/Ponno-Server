const express = require("express");
const { getAllCustomers } = require("../controllers/adminController");
const router = express.Router();
const { verifyAccessToken, verifyAdmin } = require("../middleware/auth");

router.get("/users", verifyAccessToken, verifyAdmin, getAllCustomers);

module.exports = router;
