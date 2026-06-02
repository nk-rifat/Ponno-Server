const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);

// Base Route
app.get("/", (req, res) => {
  res.send("Ponno Server Running...");
});

module.exports = app;