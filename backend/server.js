// server.js
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

// --------------------
// Middleware
// --------------------
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-tenant-id"],
  })
);

app.use(express.json());

// Tenant middleware
app.use("/shopify", (req, res, next) => {
  const tenantId = parseInt(req.header("x-tenant-id"));
  if (!tenantId)
    return res.status(400).json({ error: "x-tenant-id header is required" });
  req.tenantId = tenantId;
  next();
});

// --------------------
// Routes
// --------------------

// GET all products
app.get("/shopify/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { tenantId: req.tenantId },
    });
    res.json(products);
  } catch (err) {
    console.error("Products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET all customers
app.get("/shopify/customers", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { tenantId: req.tenantId },
    });
    res.json(customers);
  } catch (err) {
    console.error("Customers error:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// GET all orders
app.get("/shopify/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { tenantId: req.tenantId },
    });
    res.json(orders);
  } catch (err) {
    console.error("Orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Dashboard summary
app.get("/shopify/dashboard", async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const products = await prisma.product.findMany({ where: { tenantId } });
    const customers = await prisma.customer.findMany({ where: { tenantId } });
    const orders = await prisma.order.findMany({ where: { tenantId } });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const customersWithOrders = customers.map((c) => {
      const totalOrders = orders
        .filter((o) => o.customerId === c.id)
        .reduce((sum, o) => sum + o.total, 0);
      return { ...c, totalOrders };
    });

    const topCustomers = customersWithOrders
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5);

    res.json({
      productsCount: products.length,
      customersCount: customers.length,
      totalRevenue,
      orders,
      topCustomers,
      customers: customersWithOrders,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
