import { prisma } from "./prisma";
import { demoProducts } from "./demo-products";
import type { StoreProduct } from "./types";
export async function getProducts(): Promise<StoreProduct[]> {
  try {
    const products = await prisma.product.findMany({ where: { active: true }, include: { category: true, brand: true, images: { orderBy: { position: "asc" } } }, orderBy: { createdAt: "desc" } });
    return products.map(p => ({ ...p, createdAt: p.createdAt.toISOString(), images: p.images.map(i => ({ url: i.url, alt: i.alt })) }));
  } catch {
    if (process.env.DEMO_CATALOG === "true") return demoProducts;
    throw new Error("Não foi possível carregar o catálogo. Tente novamente em instantes.");
  }
}
