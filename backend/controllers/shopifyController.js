const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get Customers with order total
exports.getCustomers = async (req, res) => {
  const tenantId = parseInt(req.headers["x-tenant-id"]);
  try {
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        orders: true,
      },
    });

    const customerData = customers.map((c) => ({
      email: c.email,
      totalOrders: c.orders.reduce((sum, o) => sum + o.total, 0),
    }));

    res.json(customerData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Products with order count
exports.getProducts = async (req, res) => {
  const tenantId = parseInt(req.headers["x-tenant-id"]);
  try {
    const products = await prisma.product.findMany({
      where: { tenantId },
      include: {
        orders: true,
      },
    });

    const productData = products.map((p) => ({
      title: p.title,
      price: p.price,
      ordersCount: p.orders.length,
    }));

    res.json(productData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Orders
exports.getOrders = async (req, res) => {
  const tenantId = parseInt(req.headers["x-tenant-id"]);
  try {
    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: { customer: true, product: true },
    });

    const orderData = orders.map((o) => ({
      shopifyId: o.shopifyId,
      total: o.total,
      customer: o.customer.email,
      product: o.product.title,
    }));

    res.json(orderData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
