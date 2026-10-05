import Link from "next/link";
export default function NotFound() { return <div className="container empty-state"><span className="eyebrow">VAMOS VOLTAR AOS BÁSICOS?</span><h1>Essa página não está disponível</h1><p>Se você está procurando um pedido, abra a confirmação no mesmo navegador usado na compra.</p><Link className="button primary" href="/produtos">Explorar o catálogo</Link></div>; }
