"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag, Menu, ArrowUpRight } from "lucide-react";
import { useStore } from "./store-provider";
import { Modal } from "./modal";
import { categories } from "@/lib/demo-products";
import { whatsappUrl } from "@/lib/whatsapp";
export function Header() {
  const { count } = useStore(); const [menu, setMenu] = useState(false);
  const contact = whatsappUrl("Olá! Gostaria de atendimento na Só o Básico.");
  return <>
    <div className="announcement"><span>Seu básico. Seu jeito. Sua beleza.</span><span className="announcement-desktop">Escolha seus favoritos e finalize pelo WhatsApp <ArrowUpRight size={13} /></span></div>
    <header className="site-header"><div className="container header-main">
      <button className="icon-button mobile-menu-button" aria-label="Abrir menu" onClick={() => setMenu(true)}><Menu size={23} /></button>
      <Link href="/" className="wordmark" aria-label="Só o Básico — início">só o básico<span>BELEZA EM CADA DETALHE</span></Link>
      <form className="header-search" action="/produtos" role="search"><Search size={19} /><input name="busca" placeholder="O que você está procurando?" aria-label="Buscar por produto, marca ou categoria" /><button type="submit" className="search-submit" aria-label="Buscar"><ArrowUpRight size={19} /></button></form>
      {contact && <a className="header-contact" href={contact} target="_blank" rel="noopener noreferrer">Podemos ajudar?<span>Fale com a gente <ArrowUpRight size={13} /></span></a>}
      <Link className="cart-link" href="/carrinho" aria-label={`Carrinho com ${count} produtos`}><ShoppingBag size={24} /><span className="cart-label">Minha sacola</span><span className="cart-count">{count}</span></Link>
    </div><nav className="container desktop-nav" aria-label="Categorias"><Link href="/produtos">Todos os produtos</Link>{categories.map(c => <Link key={c.slug} href={`/produtos?categoria=${c.slug}`}>{c.name}</Link>)}<Link className="nav-offers" href="/produtos?ofertas=true">Ofertas</Link></nav></header>
    <Modal open={menu} onClose={() => setMenu(false)} title="Explore a loja" drawer><nav className="mobile-nav" aria-label="Navegação mobile"><Link onClick={() => setMenu(false)} href="/">Início</Link><Link onClick={() => setMenu(false)} href="/produtos">Todos os produtos</Link>{categories.map(c => <Link onClick={() => setMenu(false)} key={c.slug} href={`/produtos?categoria=${c.slug}`}>{c.name}</Link>)}<Link onClick={() => setMenu(false)} href="/produtos?ofertas=true">Ofertas</Link><Link onClick={() => setMenu(false)} href="/carrinho">Minha sacola ({count})</Link></nav></Modal>
  </>;
}
