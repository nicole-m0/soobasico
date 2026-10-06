import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CatalogEditorial() {
  return <section className="editorial catalog-editorial" aria-label="Um tempo para você">
    <div className="editorial-image"><Image src="/images/care.jpg" alt="Ambientação ilustrativa de cuidados pessoais" fill sizes="(max-width: 767px) 100vw, 40vw" /></div>
    <div className="editorial-copy"><span className="eyebrow">SE CUIDAR TAMBÉM É BÁSICO</span><h2>Um tempo para você.<br /><em>Todos os dias.</em></h2><p>Maquiagem, autocuidado e pequenos detalhes para acompanhar a sua rotina.</p><Link className="text-link" href="/?categoria=skincare#catalogo">Explore os cuidados com a pele <ArrowRight size={18} /></Link></div>
  </section>;
}
