// shopifySync.js
const { PrismaClient } = require("@prisma/client");
const { shopifyApi, ApiVersion } = require('@shopify/shopify-api');
const prisma = new PrismaClient();

async function fetchShopifyProducts(tenant) {
  const client = new shopifyApi.Clients.Rest(tenant.shopName, tenant.accessToken);
  const products = await client.get({ path: 'products' });
  
  for (const p of products.body.products) {
    await prisma.product.upsert({
      where: { shopifyId: p.id.toString() },
      update: { title: p.title, price: parseFloat(p.variants[0].price) },
      create: {
        shopifyId: p.id.toString(),
        title: p.title,
        price: parseFloat(p.variants[0].price),
        tenantId: tenant.id
      }
    });
  }
}

// Example usage
async function main() {
  const tenants = await prisma.tenant.findMany();
  for (const tenant of tenants) {
    await fetchShopifyProducts(tenant);
    console.log(`Synced products for tenant: ${tenant.name}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
