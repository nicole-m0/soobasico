import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
export const metadata = { title: "Catálogo" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return <Suspense fallback={<div className="container loading-state">Carregando produtos…</div>}><Catalog key={JSON.stringify(params)} /></Suspense>;
}
