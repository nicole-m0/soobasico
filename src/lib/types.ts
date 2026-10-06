export type StoreProduct = {
  id: string; name: string; slug: string; description: string;
  priceCents: number; promotionalPriceCents: number | null; stock: number;
  active: boolean; featured: boolean; bestSeller: boolean; createdAt: string;
  category: { name: string; slug: string }; brand: { name: string; slug: string };
  images: { url: string; alt: string }[];
};
export type CartItem = { productId: string; quantity: number };
export type CheckoutData = {
  name: string; whatsapp: string; cpf: string;
  postalCode: string; street: string; number: string; complement: string;
  neighborhood: string; city: string; state: string; reference: string;
  privacyAccepted: boolean;
};
export const isOnSale = (product: Pick<StoreProduct, "priceCents" | "promotionalPriceCents">) => product.promotionalPriceCents !== null && Number.isSafeInteger(product.promotionalPriceCents) && product.promotionalPriceCents > 0 && product.promotionalPriceCents < product.priceCents;
export const productPrice = (product: Pick<StoreProduct, "priceCents" | "promotionalPriceCents">) => isOnSale(product) ? product.promotionalPriceCents! : product.priceCents;
