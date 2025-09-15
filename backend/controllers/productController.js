const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addProduct = async (req, res) => {
  try {
    const tenantId = parseInt(req.headers['x-tenant-id']);
    if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

    const { shopifyId, title, price } = req.body;

    const product = await prisma.product.create({
      data: {
        shopifyId,
        title,
        price: parseFloat(price),
        tenantId,
      },
    });

    res.json(product);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Error adding product' });
  }
};
