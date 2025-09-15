// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const tenantId = 1; // For now, assume tenant 1

    const products = await prisma.product.findMany({ where: { tenantId } });
    const customers = await prisma.customer.findMany({ where: { tenantId } });
    const orders = await prisma.order.findMany({ where: { tenantId } });

    // Add totalOrders to each customer
    const customersWithOrders = customers.map(c => {
      const totalOrders = orders
        .filter(o => o.customerId === c.id)
        .reduce((sum, o) => sum + o.total, 0);
      return { ...c, totalOrders };
    });

    res.json({
      products,
      customers: customersWithOrders,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
