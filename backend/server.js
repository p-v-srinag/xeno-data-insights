// server.js
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const shopifyRoutes = require("./routes/shopifyRoutes");

const app = express();

// --- Middleware ---
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-tenant-id", "Authorization"],
  })
);

app.use(express.json());

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/shopify", shopifyRoutes);

// --- Start Server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);