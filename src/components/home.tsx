"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Sparkles, Flower2, Scissors, Paintbrush, Gem, ShoppingBag, Heart } from "lucide-react";
import { useStore } from "./store-provider";
import { categories } from "@/lib/demo-products";
import { ProductCard } from "./product-card";
const icons = [Heart, Sparkles, Scissors, Paintbrush, Flower2, Gem, ShoppingBag];
export function Home() {
  const { products } = useStore(); const [tab, setTab] = useState("favoritos");
  const selected = products.filter(p => tab === "favoritos" ? p.featured : tab === "vendidos" ? p.bestSeller : tab === "ofertas" ? p.promotionalPriceCents !== null : true).slice(0, 4);
  return <>
    <section className="hero container"><div className="hero-copy"><span className="eyebrow"><span /> O BÁSICO NUNCA FOI TÃO ESPECIAL</span><h1>Um toque de beleza.<br />Um pouco mais de <em>você.</em></h1><p>Seus essenciais de maquiagem, cuidado e acessórios.<br className="desktop-break" /> Para a rotina, para um encontro, para se sentir bem.</p><Link className="button primary" href="/produtos">Encontre seus favoritos <ArrowRight size={18} /></Link><div className="hero-note"><Heart size={16} /> Pequenos detalhes. Grandes momentos.</div></div><div className="hero-photo"><Image src="/images/hero.jpg" alt="Seleção ilustrativa de cosméticos e pincéis para a rotina de beleza" fill sizes="(max-width: 767px) 100vw, 50vw" priority /><div className="photo-caption"><span>O SEU MOMENTO DE CUIDADO</span><strong>Começa no básico.</strong></div></div><span className="hero-index">01 / BELEZA DO DIA A DIA</span></section>
    <section className="container category-section"><div className="section-heading"><div><span className="eyebrow">ESCOLHA SEU PRÓXIMO FAVORITO</span><h2>Um básico para cada momento</h2></div><Link className="text-link" href="/produtos">Ver tudo <ArrowUpRight size={18} /></Link></div><div className="category-grid">{categories.map((c, i) => { const Icon = icons[i]; return <Link key={c.slug} className="category-tile" href={`/produtos?categoria=${c.slug}`}><div style={{ background: c.color }}><Icon size={31} strokeWidth={1.3} /><ArrowUpRight className="category-arrow" size={15} /></div><span>{c.name}</span></Link>; })}</div></section>
    <section className="container featured-section"><div className="section-heading"><div><span className="eyebrow">A GENTE AMA. VOCÊ TAMBÉM VAI.</span><h2>Vai bem na sua sacola</h2></div><Link className="text-link" href="/produtos">Explorar o catálogo <ArrowUpRight size={18} /></Link></div><div className="product-tabs" role="group" aria-label="Seleção de produtos">{[["favoritos", "Nossos favoritos"], ["novidades", "Novidades"], ["vendidos", "Mais vendidos"], ["ofertas", "Ofertas"]].map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""} aria-pressed={tab === id}>{label}</button>)}</div><div className="product-grid">{selected.map(p => <ProductCard key={p.id} product={p} />)}</div><p className="demo-note">Uma prévia da experiência: produtos fictícios e imagens ilustrativas.</p></section>
    <section className="container editorial"><div className="editorial-image"><Image src="/images/care.jpg" alt="Fotografia ilustrativa de produtos de cuidado pessoal" fill sizes="(max-width: 767px) 100vw, 40vw" /></div><div className="editorial-copy"><span className="eyebrow">SE CUIDAR TAMBÉM É BÁSICO</span><h2>Um tempo para você.<br /><em>Todos os dias.</em></h2><p>Transforme os pequenos cuidados em um momento só seu. Descubra seus próximos essenciais de skincare.</p><Link className="text-link" href="/produtos?categoria=skincare">Explore os cuidados com a pele <ArrowRight size={18} /></Link></div></section>
  </>;
}
