"use client";
import Image from "next/image";
import Link from "next/link";
import { Plus, Flower2 } from "lucide-react";
import { useStore } from "./store-provider";
import { money } from "@/lib/store-config";
import { productPrice, type StoreProduct } from "@/lib/types";
export function ProductImage({ product, priority = false }: { product: StoreProduct; priority?: boolean }) {
  const image = product.images[0];
  return image ? <Image src={image.url} alt={image.alt} fill sizes="(max-width: 600px) 48vw, (max-width: 1024px) 30vw, 25vw" className="product-image" priority={priority} /> : <div className="product-placeholder"><Flower2 size={48} strokeWidth={1} /><span>só o básico</span><small>Beleza em cada detalhe</small></div>;
}
export function ProductCard({ product }: { product: StoreProduct }) {
  const { add } = useStore(); const onSale = product.promotionalPriceCents !== null;
  return <article className="product-card"><Link href={`/produtos/${product.slug}`} className="product-visual" aria-label={`Ver ${product.name}`}><ProductImage product={product} />{product.stock === 0 ? <span className="product-badge unavailable">Esgotado</span> : onSale ? <span className="product-badge">-{Math.round((1 - productPrice(product) / product.priceCents) * 100)}%</span> : product.featured ? <span className="product-badge badge-light">Nosso favorito</span> : null}</Link><div className="product-info"><span className="brand-label">{product.brand.name}</span><Link className="product-name" href={`/produtos/${product.slug}`}>{product.name}</Link><div className="product-card-bottom"><div>{onSale && <span className="old-price">{money(product.priceCents)}</span>}<strong>{money(productPrice(product))}</strong></div><button className="add-button" onClick={() => add(product)} disabled={product.stock === 0} aria-label={`Adicionar ${product.name} ao carrinho`}><Plus size={21} /></button></div></div></article>;
}
