// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with realistic Shopify data...");

  // Clean existing data
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tenant.deleteMany();

  const NUM_TENANTS = 5;
  const NUM_PRODUCTS = 100;
  const NUM_CUSTOMERS = 100;
  const NUM_ORDERS = 100;

  for (let t = 1; t <= NUM_TENANTS; t++) {
    // Create tenant with fixed ID
    const tenant = await prisma.tenant.create({
      data: {
        id: t,
        name: `Tenant ${t}`,
      },
    });

    // Create products
    const products = [];
    for (let i = 1; i <= NUM_PRODUCTS; i++) {
      const product = await prisma.product.create({
        data: {
          shopifyId: `t${t}-p${i}`,
          title: `Tenant ${t} Product ${i}`,
          price: Math.floor(Math.random() * 150) + 50, // $50-$200
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
          email: `tenant${t}-customer${i}@test.com`,
          tenantId: tenant.id,
        },
      });
      customers.push(customer);
    }

    // Create orders
    for (let i = 1; i <= NUM_ORDERS; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const total = randomProduct.price * quantity;

      await prisma.order.create({
        data: {
          shopifyId: `t${t}-o${i}`,
          total,
          customerId: randomCustomer.id,
          productId: randomProduct.id,
          tenantId: tenant.id,
        },
      });
    }

    console.log(`✅ Tenant ${t} seeded: ${NUM_PRODUCTS} products, ${NUM_CUSTOMERS} customers, ${NUM_ORDERS} orders`);
  }

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
