const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Place order (user only)
router.post("/", auth("user"), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { products } = req.body; // Array of { product: productId, quantity }

    // Check product availability and update stock
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product)
        return res
          .status(404)
          .json({ msg: `Product ${item.product} not found` });
      if (product.stockQuantity < item.quantity) {
        return res
          .status(400)
          .json({ msg: `Not enough stock for ${product.name}` });
      }
    }

    // Deduct stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    // Create order
    const order = new Order({ user: userId, products });
    await order.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// View orders (user sees own, admin sees all)
router.get("/", auth(), async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let orders;
    if (role === "admin") {
      orders = await Order.find()
        .populate("user", "name email")
        .populate("products.product", "name price");
    } else {
      orders = await Order.find({ user: userId }).populate(
        "products.product",
        "name price"
      );
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Update order status (admin only)
router.put("/:id/status", auth("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ msg: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
