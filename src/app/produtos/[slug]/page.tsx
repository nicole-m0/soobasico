import { notFound } from "next/navigation";
import { getProducts } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = (await getProducts()).find(p => p.slug === slug);
  return { title: p?.name ?? "Produto não encontrado" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const product = (await getProducts()).find(p => p.slug === slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
