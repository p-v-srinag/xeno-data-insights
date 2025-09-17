// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const crypto = require('crypto');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with realistic Shopify data...");

  // Clean existing data
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tenant.deleteMany();

  const NUM_TENANTS = 5;
  const NUM_PRODUCTS = 20;  // Reduced for faster seeding
  const NUM_CUSTOMERS = 50; // Reduced for faster seeding
  const NUM_ORDERS = 100;

  for (let t = 1; t <= NUM_TENANTS; t++) {
    const invitationCode = `invite-${crypto.randomBytes(8).toString('hex')}`;
    const tenant = await prisma.tenant.create({
      data: {
        id: t,
        name: `Tenant ${t}`,
        invitationCode: invitationCode,
      },
    });

    // Create products
    const products = [];
    for (let i = 1; i <= NUM_PRODUCTS; i++) {
      const product = await prisma.product.create({
        data: {
          shopifyId: `t${t}-p${i}`,
          title: `Product ${i}`, // Simplified title
          price: Math.floor(Math.random() * 150) + 50,
          tenantId: tenant.id,
        },
      });
      products.push(product);
    }

    // Create customers
    const customers = [];
    for (let i = 1; i <= NUM_CUSTOMERS; i++) {
      const customer = await prisma.customer.create({
        data: {
          shopifyId: `t${t}-c${i}`,
          email: `customer${i}@tenant${t}.com`,
          tenantId: tenant.id,
        },
      });
      customers.push(customer);
    }

    // Create orders with varied dates over the last 20 days
    for (let i = 1; i <= NUM_ORDERS; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const total = randomProduct.price * quantity;
      
      // Create a date in the past 20 days
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 20));

      await prisma.order.create({
        data: {
          shopifyId: `t${t}-o${i}`,
          total,
          customerId: randomCustomer.id,
          productId: randomProduct.id,
          tenantId: tenant.id,
          createdAt: pastDate, // Assign the random past date
        },
      });
    }
    console.log(`✅ Tenant ${t} seeded with invitation code: ${invitationCode}`);
  }

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());