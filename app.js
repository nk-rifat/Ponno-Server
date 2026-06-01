const express = require("express");
const cors = require("cors");
const cookieParser = required("cookie-parser");

const productRoutes = require("./routes/productRoutes");

const app = express();

// Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/products", productRoutes);

// Base Route
app.get("/", (req, res) => {
  res.send("Ponno Server Running...");
});

module.exports = app;
