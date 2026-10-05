import { PrismaClient } from "@prisma/client";
import { demoProducts, categories } from "../src/lib/demo-products";
const db = new PrismaClient();
async function main() {
  for (const c of categories) await db.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: { name: c.name, slug: c.slug } });
  for (const p of demoProducts) {
    const category = await db.category.findUniqueOrThrow({ where: { slug: p.category.slug } });
    const brand = await db.brand.upsert({ where: { slug: p.brand.slug }, update: { name: p.brand.name }, create: p.brand });
    await db.product.upsert({ where: { slug: p.slug }, update: {}, create: {
      id: p.id, name: p.name, slug: p.slug, description: p.description, priceCents: p.priceCents,
      promotionalPriceCents: p.promotionalPriceCents, stock: p.stock, active: p.active, featured: p.featured,
      bestSeller: p.bestSeller, createdAt: new Date(p.createdAt), categoryId: category.id, brandId: brand.id,
      images: { create: p.images.map((image, position) => ({ ...image, position })) },
    } });
  }
  console.info("Seed concluído: 12 produtos fictícios. Produtos existentes e estoque foram preservados.");
}
main().catch(() => { console.error("Falha ao executar seed. Verifique DATABASE_URL e as migrações."); process.exitCode = 1; }).finally(() => db.$disconnect());
