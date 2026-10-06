"use client";
import Image from "next/image";
import Link from "next/link";
import { Plus, Flower2 } from "lucide-react";
import { useStore } from "./store-provider";
import { money } from "@/lib/store-config";
import { isOnSale, productPrice, type StoreProduct } from "@/lib/types";
export function ProductImage({ product, priority = false }: { product: StoreProduct; priority?: boolean }) {
  const image = product.images[0];
  return image ? <Image src={image.url} alt={image.alt} fill sizes="(max-width: 600px) 48vw, (max-width: 1024px) 30vw, 25vw" className="product-image" priority={priority} /> : <div className="product-placeholder"><Flower2 size={48} strokeWidth={1} /><span>só o básico</span><small>Beleza em cada detalhe</small></div>;
}
export function ProductCard({ product }: { product: StoreProduct }) {
  const { add, items, catalogTime } = useStore(); const onSale = isOnSale(product);
  const newProduct = catalogTime - Date.parse(product.createdAt) <= 30 * 86400000 && Date.parse(product.createdAt) <= catalogTime;
  const full = (items.find(i => i.productId === product.id)?.quantity ?? 0) >= Math.min(product.stock, 99);
  return <article className="product-card"><Link href={`/produtos/${product.slug}`} className="product-visual" aria-label={`Ver ${product.name}`}><ProductImage product={product} /><div className="product-badges">{product.stock === 0 ? <span className="product-badge unavailable">Esgotado</span> : <>{onSale && <span className="product-badge">Oferta -{Math.round((1 - productPrice(product) / product.priceCents) * 100)}%</span>}{product.stock <= 3 && <span className="product-badge badge-light">Últimas unidades</span>}{newProduct && <span className="product-badge badge-light">Novo</span>}</>}</div></Link><div className="product-info"><span className="brand-label">{product.brand.name}</span><Link className="product-name" href={`/produtos/${product.slug}`}>{product.name}</Link><div className="product-card-bottom"><div>{onSale && <span className="old-price">{money(product.priceCents)}</span>}<strong>{money(productPrice(product))}</strong></div><button className="add-button" onClick={() => add(product)} disabled={!product.active || full} aria-label={`Adicionar ${product.name} ao carrinho`}><Plus size={21} /></button></div></div></article>;
}
