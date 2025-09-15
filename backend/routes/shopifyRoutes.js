const express = require("express");
const router = express.Router();
const tenantMiddleware = require("../middleware/tenantMiddleware");
const {
  getCustomers, addCustomer,
  getProducts, addProduct,
  getOrders, addOrder
} = require("../controllers/shopifyController");

// Customers
router.get("/customers", tenantMiddleware, getCustomers);
router.post("/customers", tenantMiddleware, addCustomer);

// Products
router.get("/products", tenantMiddleware, getProducts);
router.post("/products", tenantMiddleware, addProduct);

// Orders
router.get("/orders", tenantMiddleware, getOrders);
router.post("/orders", tenantMiddleware, addOrder);

module.exports = router;
