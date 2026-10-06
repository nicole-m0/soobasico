"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Sparkles, Flower2, Scissors, Paintbrush, Gem, ShoppingBag, Heart } from "lucide-react";
import { categories } from "@/lib/demo-products";
import { Catalog } from "./catalog";
const icons = [Heart, Sparkles, Scissors, Paintbrush, Flower2, Gem, ShoppingBag];
export function Home() {
  return <>
    <section className="hero container"><div className="hero-copy"><span className="eyebrow"><span /> O BÁSICO NUNCA FOI TÃO ESPECIAL</span><h1>Um toque de beleza.<br />Um pouco mais de <em>você.</em></h1><p>Seus essenciais de maquiagem, cuidado e acessórios.<br className="desktop-break" /> Para a rotina, para um encontro, para se sentir bem.</p><Link className="button primary" href="/#catalogo">Encontre seus favoritos <ArrowRight size={18} /></Link><div className="hero-note"><Heart size={16} /> Pequenos detalhes. Grandes momentos.</div></div><div className="hero-photo"><Image src="/images/hero.jpg" alt="Seleção ilustrativa de cosméticos e pincéis para a rotina de beleza" fill sizes="(max-width: 767px) 100vw, 50vw" priority /><div className="photo-caption"><span>O SEU MOMENTO DE CUIDADO</span><strong>Começa no básico.</strong></div></div><span className="hero-index">01 / BELEZA DO DIA A DIA</span></section>
    <section className="container category-section"><div className="section-heading"><div><span className="eyebrow">ESCOLHA SEU PRÓXIMO FAVORITO</span><h2>Um básico para cada momento</h2></div><Link className="text-link" href="/#catalogo">Ver tudo <ArrowUpRight size={18} /></Link></div><div className="category-grid">{categories.map((c, i) => { const Icon = icons[i]; return <Link key={c.slug} className="category-tile" href={`/?categoria=${c.slug}#catalogo`}><div style={{ background: c.color }}><Icon size={31} strokeWidth={1.3} /><ArrowUpRight className="category-arrow" size={15} /></div><span>{c.name}</span></Link>; })}</div></section>
    <Catalog home />
  </>;
}
