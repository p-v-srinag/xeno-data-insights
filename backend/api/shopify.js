import { PrismaClient } from "@prisma/client";
import Cors from "cors";

const prisma = new PrismaClient();
const cors = Cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET"],
  allowedHeaders: ["Content-Type", "x-tenant-id"],
});

// Helper to run CORS
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) reject(result);
      else resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const tenantId = parseInt(req.headers["x-tenant-id"]);
  if (!tenantId)
    return res.status(400).json({ error: "x-tenant-id header is required" });

  try {
    if (req.url.endsWith("/products")) {
      const products = await prisma.product.findMany({ where: { tenantId } });
      return res.json(products);
    }

    if (req.url.endsWith("/customers")) {
      const customers = await prisma.customer.findMany({ where: { tenantId } });
      return res.json(customers);
    }

    if (req.url.endsWith("/orders")) {
      const orders = await prisma.order.findMany({ where: { tenantId } });
      return res.json(orders);
    }

    if (req.url.endsWith("/dashboard")) {
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

      return res.json({
        productsCount: products.length,
        customersCount: customers.length,
        totalRevenue,
        orders,
        topCustomers,
        customers: customersWithOrders,
      });
    }

    return res.status(404).json({ error: "Route not found" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
