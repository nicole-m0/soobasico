import { PrismaClient } from "@prisma/client";
import { demoProducts } from "../src/lib/demo-products";
const db = new PrismaClient();
async function main() {
  // Dados exclusivamente demonstrativos. Complementa até 40 sem atualizar registros existentes.
  const result = await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(40061006)`;
    const before = await tx.product.count();
    const existing = new Set((await tx.product.findMany({ select: { slug: true } })).map(p => p.slug));
    const missing = demoProducts.filter(p => !existing.has(p.slug)).slice(0, Math.max(0, 40 - before));
    for (const p of missing) {
      const category = await tx.category.upsert({ where: { slug: p.category.slug }, update: {}, create: { name: p.category.name, slug: p.category.slug } });
      const brand = await tx.brand.upsert({ where: { slug: p.brand.slug }, update: {}, create: p.brand });
      await tx.product.create({ data: {
        id: p.id, name: p.name, slug: p.slug, description: p.description, priceCents: p.priceCents,
        promotionalPriceCents: p.promotionalPriceCents, stock: p.stock, active: p.active, featured: p.featured,
        bestSeller: p.bestSeller, categoryId: category.id, brandId: brand.id,
        images: { create: p.images.map((image, position) => ({ ...image, position })) },
      } });
    }
    // Completa apenas imagens ausentes de registros demonstrativos identificados por id E slug.
    // Imagens reais ou trocadas no cadastro são preservadas.
    let illustrated = 0;
    for (const p of demoProducts) {
      const existingProduct = await tx.product.findFirst({ where: { id: p.id, slug: p.slug }, include: { images: true } });
      if (!existingProduct || !p.images.length) continue;
      if (!existingProduct.images.length) {
        await tx.productImage.createMany({ data: p.images.map((image, position) => ({ ...image, position, productId: p.id })) });
        illustrated++;
      } else if (p.slug === "serum-facial" && existingProduct.images.length === 1 && existingProduct.images[0].url === "/images/products/skincare.svg") {
        // Corrige somente a ilustração genérica antiga (pote), agora com um conta-gotas.
        await tx.productImage.update({ where: { id: existingProduct.images[0].id }, data: p.images[0] });
        illustrated++;
      }
    }
    return { before, added: missing.length, total: await tx.product.count(), illustrated };
  }, { timeout: 30000 });
  console.info(`Catálogo demonstrativo: ${result.before} anteriores + ${result.added} novos = ${result.total} produtos. Registros existentes preservados.`);
  console.info(`Ilustrações locais completadas/corrigidas: ${result.illustrated}. Imagens próprias preservadas.`);
}
main().catch(() => { console.error("Falha ao executar seed. Verifique DATABASE_URL e as migrações."); process.exitCode = 1; }).finally(() => db.$disconnect());
