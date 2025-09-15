const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding tenants, products, customers, orders...");

  for (let t = 1; t <= 5; t++) {
    const tenant = await prisma.tenant.create({
      data: { name: `Tenant ${t}` }
    });

    for (let p = 1; p <= 4; p++) {
      // Product
      await prisma.product.upsert({
        where: { shopifyId: `p${t}${p}` },
        update: {},
        create: {
          shopifyId: `p${t}${p}`,
          title: `Product ${t}${p}`,
          price: Math.floor(Math.random() * 100) + 1,
          tenantId: tenant.id
        }
      });

      // Customer
      await prisma.customer.upsert({
        where: { shopifyId: `c${t}${p}` },
        update: {},
        create: {
          shopifyId: `c${t}${p}`,
          email: `customer${t}${p}@test.com`,
          tenantId: tenant.id
        }
      });

      // Order
      await prisma.order.upsert({
        where: { shopifyId: `o${t}${p}` },
        update: {},
        create: {
          shopifyId: `o${t}${p}`,
          total: Math.floor(Math.random() * 500) + 50,
          tenantId: tenant.id
        }
      });
    }
  }

  console.log("✅ Seeding complete. 20 products, customers, orders created per schema.");

  // Simulate Shopify sync (just updating product titles)
  const allProducts = await prisma.product.findMany();
  for (const p of allProducts) {
    await prisma.product.update({
      where: { id: p.id },
      data: { title: `${p.title} (synced)` }
    });
  }

  console.log("✅ Shopify sync simulation complete.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
