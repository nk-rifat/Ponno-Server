const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const adminOrdersRoutes = require("./routes/adminOrderRoutes");

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminCustomerRoutes);
app.use("/api/admin", adminProductRoutes);
app.use("/api/admin", adminOrdersRoutes);

// Base Route
app.get("/", (req, res) => {
  res.send("Ponno Server Running...");
});

module.exports = app;
