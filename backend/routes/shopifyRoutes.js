const express = require("express");
const router = express.Router();
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getCustomers,
  getProducts,
  getOrders,
  getDashboardData, // Import the new dashboard function
} = require("../controllers/shopifyController");

// Protect all shopify routes
router.use(authMiddleware);

// Dashboard
router.get("/dashboard", tenantMiddleware, getDashboardData); // Add this route

// Customers
router.get("/customers", tenantMiddleware, getCustomers);

// Products
router.get("/products", tenantMiddleware, getProducts);

// Orders
router.get("/orders", tenantMiddleware, getOrders);

module.exports = router;