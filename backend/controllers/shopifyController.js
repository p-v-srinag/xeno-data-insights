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
      ...c,
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
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Orders with date range filtering
exports.getOrders = async (req, res) => {
  const tenantId = parseInt(req.headers["x-tenant-id"]);
  const { startDate, endDate } = req.query;

  let whereClause = { tenantId };

  if (startDate && endDate) {
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  try {
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: { customer: true, product: true },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Dashboard summary
exports.getDashboardData = async (req, res) => {
  const tenantId = parseInt(req.headers["x-tenant-id"]);
  const { startDate, endDate } = req.query;

  try {
    let orderWhereClause = { tenantId };
    if (startDate && endDate) {
      orderWhereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const products = await prisma.product.findMany({ where: { tenantId } });
    const customers = await prisma.customer.findMany({ where: { tenantId } });
    const orders = await prisma.order.findMany({ where: orderWhereClause });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const customersWithOrders = customers.map((c) => {
      const totalSpend = orders
        .filter((o) => o.customerId === c.id)
        .reduce((sum, o) => sum + o.total, 0);
      return { ...c, totalOrders: totalSpend }; // Use totalSpend for consistency
    });

    const topCustomers = customersWithOrders
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5);

    res.json({
      productsCount: products.length,
      customersCount: customers.length,
      totalRevenue,
      orders, // Orders are now filtered by date if provided
      topCustomers,
      customers: customersWithOrders,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};