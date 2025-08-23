require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Enable CORS for all origins in development, more restrictive in production
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-production-domain.com"] // Replace with your production domain
        : [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
          ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes setup
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products"); // Register product routes
const dummyProductRoutes = require("./routes/dummyProducts");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // Register product routes
app.use("/api/dummy-products", dummyProductRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid conflict with macOS Control Center
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
