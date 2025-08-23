const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Add dummy products
router.post("/", async (req, res) => {
  const dummyProducts = [
    {
      name: "Dummy Product 1",
      description: "Description for product 1",
      price: 10.99,
      stockQuantity: 100,
    },
    {
      name: "Dummy Product 2",
      description: "Description for product 2",
      price: 15.99,
      stockQuantity: 50,
    },
    {
      name: "Dummy Product 3",
      description: "Description for product 3",
      price: 20.99,
      stockQuantity: 75,
    },
  ];

  try {
    await Product.insertMany(dummyProducts);
    res.status(201).json({ msg: "Dummy products added successfully!" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Failed to add dummy products", error: err.message });
  }
});

module.exports = router;
