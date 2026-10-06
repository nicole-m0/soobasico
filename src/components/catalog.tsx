"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";
import { SlidersHorizontal, Search, X, ArrowRight } from "lucide-react";
import { useStore } from "./store-provider";
import { ProductCard } from "./product-card";
import { CatalogEditorial } from "./catalog-editorial";
import { Modal } from "./modal";
import { isOnSale, productPrice } from "@/lib/types";

export function Catalog({ home = false }: { home?: boolean }) {
  const params = useSearchParams();
  // Header navigation may change only the URL query, keeping this component mounted.
  return <CatalogContent key={params.toString()} home={home} initialCategory={params.get("categoria") ?? ""} initialQuery={params.get("busca") ?? ""} initialSale={params.get("ofertas") === "true"} />;
}

function CatalogContent({ home, initialCategory, initialQuery, initialSale }: { home: boolean; initialCategory: string; initialQuery: string; initialSale: boolean }) {
  const { products } = useStore();
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [available, setAvailable] = useState(false);
  const [sale, setSale] = useState(initialSale);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("new");
  const [drawer, setDrawer] = useState(false);
  const [pageState, setPage] = useState({ key: "", page: 1 });
  const filterKey = JSON.stringify([category, brand, maxPrice, available, sale, query, sort]);
  if (pageState.key !== filterKey) setPage({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const activeProducts = products.filter(p => p.active);
  const categories = [...new Map(activeProducts.map(p => [p.category.slug, p.category])).values()];
  const brands = [...new Set(activeProducts.map(p => p.brand.name))].sort();
  const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtered = activeProducts.filter(p => (!category || p.category.slug === category) && (!brand || p.brand.name === brand) && (!maxPrice || productPrice(p) <= Number(maxPrice) * 100) && (!available || p.stock > 0) && (!sale || isOnSale(p)) && normalize(`${p.name} ${p.brand.name} ${p.category.name}`).includes(normalize(query))).sort((a, b) => sort === "low" ? productPrice(a) - productPrice(b) : sort === "high" ? productPrice(b) - productPrice(a) : sort === "az" ? a.name.localeCompare(b.name, "pt-BR") : b.createdAt.localeCompare(a.createdAt));
  const visible = home ? filtered.slice(0, page * 12) : filtered.slice((page - 1) * 12, page * 12);
  const clear = () => { setCategory(""); setBrand(""); setMaxPrice(""); setAvailable(false); setSale(false); setQuery(""); };
  const activeCount = [category, brand, maxPrice, available, sale].filter(Boolean).length;
  const title = categories.find(c => c.slug === category)?.name ?? (sale ? "Ofertas" : home ? "Todos os produtos" : "Encontre seu básico");
  function filters(mobile: boolean) {
    return <div className="filters">
      <fieldset><legend>Categorias</legend><label className="filter-option"><input type="radio" name={mobile ? "mobile-category" : "category"} checked={!category} onChange={() => setCategory("")} />Todos os produtos</label>{categories.map(c => <label className="filter-option" key={c.slug}><input type="radio" name={mobile ? "mobile-category" : "category"} checked={category === c.slug} onChange={() => setCategory(c.slug)} />{c.name}</label>)}</fieldset>
      <label className="filter-label">Marca<select aria-label="Marca" value={brand} onChange={e => setBrand(e.target.value)}><option value="">Todas as marcas</option>{brands.map(b => <option key={b}>{b}</option>)}</select></label>
      <label className="filter-label">Faixa de preço<select aria-label="Faixa de preço" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}><option value="">Todos os preços</option><option value="15">Até R$ 15</option><option value="30">Até R$ 30</option><option value="50">Até R$ 50</option><option value="100">Até R$ 100</option></select></label>
      <fieldset><legend>Disponibilidade</legend><label className="filter-option"><input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} />Somente em estoque</label><label className="filter-option"><input type="checkbox" checked={sale} onChange={e => setSale(e.target.checked)} />Somente ofertas</label></fieldset>
      {activeCount > 0 && <button className="text-link" onClick={clear}>Limpar filtros <X size={15} /></button>}
    </div>;
  }
  return <div id={home ? "catalogo" : undefined} className={`container page-space ${home ? "home-catalog" : ""}`}>
    {!home && <nav className="breadcrumbs"><Link href="/">Início</Link><span>/</span><span>Catálogo</span></nav>}
    <div className="catalog-title"><span className="eyebrow">EXPLORE A SÓ O BÁSICO</span>{home ? <h2>{title}</h2> : <h1>{title}</h1>}<p>Maquiagem, autocuidado e acessórios escolhidos para fazer parte da sua rotina.</p></div>
    <div className="catalog-layout">
      {!home && <aside className="catalog-sidebar"><div className="filter-heading"><SlidersHorizontal size={18} /><h2>Filtrar produtos</h2></div>{filters(false)}</aside>}
      <div className="catalog-results">
        <div className="catalog-controls">
          <div className="catalog-search"><Search size={18} /><input aria-label="Buscar no catálogo" placeholder="Produto, marca ou categoria" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Limpar busca" onClick={() => setQuery("")}><X size={16} /></button>}</div>
          <button className="filter-mobile button secondary" onClick={() => setDrawer(true)}><SlidersHorizontal size={17} />Filtrar{activeCount > 0 && ` (${activeCount})`}</button>
          <label className="sort-label"><span>Ordenar por</span><select aria-label="Ordenar produtos" value={sort} onChange={e => setSort(e.target.value)}><option value="new">Novidades</option><option value="low">Menor preço</option><option value="high">Maior preço</option><option value="az">Nome A–Z</option></select></label>
        </div>
        <div className="results-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "produto" : "produtos"}{query && ` para “${query}”`}</div>
        {visible.length ? home ? <>
          {Array.from({ length: Math.ceil(visible.length / 12) }, (_, group) => <Fragment key={group}>
            <div className="product-grid home-product-grid">{visible.slice(group * 12, (group + 1) * 12).map(p => <ProductCard key={p.id} product={p} />)}</div>
            {group === 0 && !category && !query && !sale && !brand && !maxPrice && !available && <CatalogEditorial />}
          </Fragment>)}
        </> : <div className="product-grid catalog-product-grid">{visible.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="empty-state"><Search size={38} strokeWidth={1.3} /><h2>Nenhum básico por aqui ainda</h2><p>Tente outro nome ou ajuste os filtros para encontrar seus favoritos.</p><button onClick={clear} className="button primary">Ver todos os produtos <ArrowRight size={17} /></button></div>}
        {home ? <div className="catalog-load-more"><p aria-live="polite">Mostrando {visible.length} de {filtered.length} produtos</p>{visible.length < filtered.length && <button className="button primary" onClick={() => setPage({ key: filterKey, page: page + 1 })}>Ver mais produtos <ArrowRight size={17} /></button>}</div> : filtered.length > 12 && <nav className="catalog-pagination" aria-label="Páginas do catálogo"><button className="button secondary" disabled={page === 1} onClick={() => setPage({ key: filterKey, page: page - 1 })}>Anterior</button><span aria-live="polite">Página {page} de {Math.ceil(filtered.length / 12)}</span><button className="button secondary" disabled={page >= Math.ceil(filtered.length / 12)} onClick={() => setPage({ key: filterKey, page: page + 1 })}>Próxima</button></nav>}
        <p className="demo-note">Produtos de demonstração e imagens ilustrativas para testes.</p>
      </div>
    </div>
    <Modal open={drawer} onClose={() => setDrawer(false)} title="Filtrar produtos" drawer>{filters(true)}<button className="button primary full" onClick={() => setDrawer(false)}>Ver {filtered.length} produtos</button></Modal>
  </div>;
}
