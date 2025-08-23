const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get user's cart
router.get("/", auth("user"), async (req, res) => {
  try {
    const userId = req.user.userId;
    let cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price stockQuantity"
    );

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Add item to cart
router.post("/", auth("user"), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        name: product.name,
        price: product.price,
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate("items.productId", "name price stockQuantity");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Update cart item quantity
router.put("/:productId", auth("user"), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ msg: "Item not found in cart" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate("items.productId", "name price stockQuantity");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Remove item from cart
router.delete("/:productId", auth("user"), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate("items.productId", "name price stockQuantity");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Clear cart
router.delete("/", auth("user"), async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ msg: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
