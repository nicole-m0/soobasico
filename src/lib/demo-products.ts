import type { StoreProduct } from "./types";
export const categories = [
  { name: "Maquiagem", slug: "maquiagem", icon: "lipstick", color: "#f2d9de", caption: "Seu toque de cor" },
  { name: "Skincare", slug: "skincare", icon: "sparkles", color: "#efe5db", caption: "Um carinho na pele" },
  { name: "Cabelos", slug: "cabelos", icon: "scissors", color: "#e8ded5", caption: "Cuidado da raiz às pontas" },
  { name: "Unhas", slug: "unhas", icon: "paintbrush", color: "#efd5d6", caption: "Cor em cada detalhe" },
  { name: "Perfumes", slug: "perfumes", icon: "flower", color: "#e7dfec", caption: "Sua presença, sua essência" },
  { name: "Acessórios", slug: "acessorios", icon: "gem", color: "#e5e6da", caption: "Detalhes que encantam" },
  { name: "Bolsas e nécessaires", slug: "bolsas", icon: "bag", color: "#efdfd3", caption: "Tudo com você" },
];
const entries: { name: string; slug: string; category: string; brand: string; price: number; promo?: number; stock?: number; image?: string; featured?: boolean; bestSeller?: boolean; description: string }[] = [
  { name: "Batom cremoso Rosa Chá", slug: "batom-rosa-cha", category: "maquiagem", brand: "Básica Beauty", price: 2490, promo: 1990, image: "lipstick", featured: true, bestSeller: true, description: "Um rosa delicado para acompanhar você todos os dias. Textura cremosa e acabamento confortável. Cor e embalagem ilustrativas para desenvolvimento." },
  { name: "Hidratante facial diário", slug: "hidratante-facial", category: "skincare", brand: "Pele & Cuidado", price: 3290, image: "skincare", featured: true, bestSeller: true, description: "Seu momento de cuidado na rotina. Hidratante facial de demonstração, com textura leve. Produto fictício: composição e indicação serão preenchidas com os dados reais." },
  { name: "Esmalte nude rosado", slug: "esmalte-nude", category: "unhas", brand: "Cor de Mim", price: 790, promo: 590, image: "nails", featured: true, bestSeller: true, description: "Um toque de rosa para uma manicure delicada. Cor ilustrativa. Produto fictício para testar o catálogo e o pedido." },
  { name: "Nécessaire essencial", slug: "necessaire-essencial", category: "bolsas", brand: "Básica Beauty", price: 3990, image: "bag", featured: true, description: "Seus favoritos sempre por perto. Nécessaire de demonstração para organizar maquiagem e acessórios. Fotografia ilustrativa." },
  { name: "Máscara de cílios Volume", slug: "mascara-volume", category: "maquiagem", brand: "Básica Beauty", price: 2890, image: "mascara", bestSeller: true, description: "Para dar destaque ao olhar. Máscara de cílios fictícia com embalagem ilustrativa; características do produto real serão cadastradas posteriormente." },
  { name: "Presilha de cabelo perolada", slug: "presilha-perolada", category: "acessorios", brand: "Detalhe", price: 1250, image: "clip", featured: true, description: "Um detalhe delicado para transformar o penteado. Acessório fictício, criado para a demonstração da loja." },
  { name: "Perfume Flor de Algodão", slug: "perfume-flor", category: "perfumes", brand: "Essência", price: 6990, promo: 5990, image: "perfume", featured: true, description: "Uma pausa perfumada no seu dia. Perfume de teste com fotografia ilustrativa. Notas e volume devem ser substituídos pelos dados do produto real." },
  { name: "Óleo capilar toque leve", slug: "oleo-capilar", category: "cabelos", brand: "Fio a Fio", price: 2390, image: "hair", description: "Um cuidado a mais para seus fios. Produto fictício para testar as categorias e o fluxo de compra; imagem ilustrativa." },
  { name: "Base líquida Natural", slug: "base-natural", category: "maquiagem", brand: "Básica Beauty", price: 3590, description: "Base de demonstração. Tonalidade, volume e composição serão definidos quando o catálogo real for cadastrado." },
  { name: "Espelho de bolsa", slug: "espelho-bolsa", category: "acessorios", brand: "Detalhe", price: 990, description: "Compacto para levar com você. Acessório fictício de demonstração, sem fotografia cadastrada." },
  { name: "Sérum facial iluminador", slug: "serum-facial", category: "skincare", brand: "Pele & Cuidado", price: 4590, stock: 0, image: "skincare", description: "Produto fictício para demonstrar o estado indisponível. Imagem ilustrativa, sem promessa de eficácia." },
  { name: "Pincel para blush", slug: "pincel-blush", category: "maquiagem", brand: "Básica Beauty", price: 1890, image: "brush", description: "Um pincel para completar seu kit. Acessório de demonstração com imagem ilustrativa." },
];
export const demoProducts: StoreProduct[] = entries.map((p, i) => ({
  id: `demo-${p.slug}`, name: p.name, slug: p.slug, description: p.description,
  priceCents: p.price, promotionalPriceCents: p.promo ?? null, stock: p.stock ?? 20,
  active: true, featured: p.featured ?? false, bestSeller: p.bestSeller ?? false,
  createdAt: new Date(Date.UTC(2026, 9, 1, 0, i)).toISOString(),
  category: categories.find(c => c.slug === p.category)!,
  brand: { name: p.brand, slug: p.brand.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") },
  images: p.image ? [{ url: `/images/products/${p.image}.svg`, alt: `Ilustração de ${p.name}; produto fictício` }] : [],
}));
