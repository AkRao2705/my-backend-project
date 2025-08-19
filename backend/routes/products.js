const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get all products (+ search/filter)
router.get("/", async (req, res) => {
  try {
    const { search, min, max } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (min || max) query.price = {};
    if (min) query.price.$gte = Number(min);
    if (max) query.price.$lte = Number(max);

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get product by id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Create product (admin only)
router.post("/", auth("admin"), async (req, res) => {
  try {
    const prod = new Product(req.body);
    await prod.save();
    res.status(201).json(prod);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Update product (admin only)
router.put("/:id", auth("admin"), async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ msg: "Product not found" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Delete product (admin only)
router.delete("/:id", auth("admin"), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});
module.exports = router;
