import type { Metadata } from "next";
import { getProducts, getCatalogTime } from "@/lib/catalog";
import { StoreProvider } from "@/components/store-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Só o Básico | Beleza em cada detalhe", template: "%s | Só o Básico" }, description: "Maquiagem, cuidados e acessórios. Escolha seus favoritos e finalize seu pedido com a Só o Básico pelo WhatsApp.", icons: { icon: "/favicon.svg" } };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const products = await getProducts();
  return <html lang="pt-BR" data-scroll-behavior="smooth"><body><StoreProvider products={products} catalogTime={getCatalogTime()}><a className="skip-link" href="#main">Ir para o conteúdo</a><Header /><main id="main">{children}</main><Footer /></StoreProvider></body></html>;
}
