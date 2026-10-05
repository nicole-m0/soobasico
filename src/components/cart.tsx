"use client";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2 } from "lucide-react";
import { useStore } from "./store-provider";
import { ProductImage } from "./product-card";
import { Quantity } from "./quantity";
import { OrderSummary } from "./order-summary";
import { money } from "@/lib/store-config";
import { productPrice } from "@/lib/types";
export function Cart() {
  const { lines, count, hydrated, update, remove } = useStore();
  if (!hydrated) return <div className="container loading-state" role="status">Carregando sua sacola…</div>;
  const invalid = lines.some(i => i.quantity > i.product.stock || !i.product.active);
  return <div className="container page-space"><nav className="breadcrumbs"><Link href="/">Início</Link><span>/</span><span>Minha sacola</span></nav><div className="page-title"><span className="eyebrow">OS SEUS FAVORITOS ESTÃO AQUI</span><h1>Minha sacola <span className="heading-count">({count})</span></h1></div>{lines.length ? <div className="cart-layout"><div><div className="cart-table-header"><span>Produto</span><span>Quantidade</span><span>Subtotal</span></div>{lines.map(({ product, quantity }) => <article key={product.id} className="cart-row"><Link className="cart-product-image" href={`/produtos/${product.slug}`}><ProductImage product={product} /></Link><div className="cart-product-info"><span className="brand-label">{product.brand.name}</span><Link href={`/produtos/${product.slug}`}>{product.name}</Link><span>{money(productPrice(product))} / unidade</span>{quantity > product.stock && <p className="field-error">Estoque atual: {product.stock}. Ajuste a quantidade ou remova.</p>}<button className="remove-button" onClick={() => remove(product.id)}><Trash2 size={13} />Remover</button></div><Quantity value={quantity} max={product.stock} onChange={n => update(product.id, n)} label={product.name} /><strong className="cart-line-total">{money(productPrice(product) * quantity)}</strong></article>)}<Link className="text-link continue-shopping" href="/produtos"><ArrowLeft size={17} />Continuar comprando</Link></div><OrderSummary>{invalid ? <p role="alert" className="field-error">Ajuste os produtos indisponíveis antes de continuar.</p> : <Link className="button primary full" href="/checkout">Continuar para finalizar pedido <ArrowRight size={17} /></Link>}</OrderSummary></div> : <div className="empty-state"><ShoppingBag size={46} strokeWidth={1.2} /><h2>Sua sacola está esperando seus favoritos</h2><p>Encontre os pequenos detalhes que deixam seu dia mais bonito.</p><Link className="button primary" href="/produtos">Explorar o catálogo <ArrowRight size={17} /></Link></div>}</div>;
}
