import Link from "next/link";
import { ArrowUpRight, MessageCircle, ShoppingBag, Heart, Truck } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";
export function Footer() {
  const contact = whatsappUrl("Olá! Gostaria de atendimento na Só o Básico.");
  return <footer><div className="benefits container"><div><Heart size={23} /><span>Escolhidos com carinho<small>Beleza nos pequenos detalhes</small></span></div><div><ShoppingBag size={23} /><span>Compre do seu jeito<small>Monte sua sacola sem pressa</small></span></div><div><MessageCircle size={23} /><span>Atendimento de verdade<small>Finalize com a gente no WhatsApp</small></span></div><div><Truck size={23} /><span>Entrega combinada<small>Confirmamos tudo com você</small></span></div></div>
    <div className="footer-main"><div className="container footer-grid"><div><Link href="/" className="wordmark">só o básico</Link><p>Maquiagem, cuidado e aqueles detalhes<br />que deixam o dia mais bonito.</p></div><div><strong>Explore</strong><Link href="/produtos">Todos os produtos</Link><Link href="/produtos?ofertas=true">Ofertas</Link><Link href="/carrinho">Minha sacola</Link></div><div><strong>Vamos conversar?</strong><p>Conte com a gente para escolher<br />e finalizar seu pedido.</p>{contact && <a href={contact} target="_blank" rel="noopener noreferrer">Atendimento pelo WhatsApp <ArrowUpRight size={15} /></a>}</div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Só o Básico</span><Link href="/privacidade">Privacidade e seus dados</Link><span>Catálogo de demonstração · produtos fictícios</span></div></div>
  </footer>;
}
