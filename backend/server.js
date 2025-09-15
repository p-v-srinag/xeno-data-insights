// server.js
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

// --------------------
// Middleware
// --------------------
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-tenant-id"],
}));

app.use(express.json());

// Inline tenant middleware for /shopify routes
app.use("/shopify", (req, res, next) => {
  const tenantId = parseInt(req.header("x-tenant-id"));
  if (!tenantId) return res.status(400).json({ error: "x-tenant-id header is required" });
  req.tenantId = tenantId;
  next();
});

// --------------------
// Shopify Routes
// --------------------

// GET all products for tenant
app.get("/shopify/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { tenantId: req.tenantId },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET all customers for tenant
app.get("/shopify/customers", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { tenantId: req.tenantId },
    });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// GET all orders for tenant
app.get("/shopify/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { tenantId: req.tenantId },
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// --------------------
// Dashboard Route
// --------------------
app.get("/shopify/dashboard", async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Fetch data for tenant
    const products = await prisma.product.findMany({ where: { tenantId } });
    const customers = await prisma.customer.findMany({ where: { tenantId } });
    const orders = await prisma.order.findMany({ where: { tenantId } });

    // Total revenue
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    // Total orders per customer
    const customersWithOrders = customers.map(c => {
      const totalOrders = orders
        .filter(o => o.customerId === c.id)
        .reduce((sum, o) => sum + o.total, 0);
      return { ...c, totalOrders };
    });

    // Top 5 customers by totalOrders
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// --------------------
// Start Server
// --------------------
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
