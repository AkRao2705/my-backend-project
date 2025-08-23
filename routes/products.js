const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Add a new product
router.post("/", auth("admin"), async (req, res) => {
  const { name, description, price, stockQuantity } = req.body;
  try {
    const newProduct = new Product({ name, description, price, stockQuantity });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Update a product
router.put("/:id", auth("admin"), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stockQuantity } = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stockQuantity },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Delete a product
router.delete("/:id", auth("admin"), async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
