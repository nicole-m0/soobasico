import { productPrice, type CartItem } from "./types";
import { ValidationError } from "./validation";
type PricedProduct = { id: string; name: string; priceCents: number; promotionalPriceCents: number | null; stock: number; active: boolean };
export function calculateOrder(cart: CartItem[], products: PricedProduct[], deliveryFeeCents: number) {
  if (!Number.isSafeInteger(deliveryFeeCents) || deliveryFeeCents < 0) throw new ValidationError("Taxa de entrega inválida.");
  const items = cart.map(item => {
    const p = products.find(product => product.id === item.productId);
    if (!p || !p.active) throw new ValidationError("Um produto do carrinho não está mais disponível. Volte ao carrinho para conferir.");
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || p.stock < item.quantity) throw new ValidationError(`A quantidade de ${p.name} excede o estoque disponível.`);
    if (p.promotionalPriceCents !== null && (!Number.isSafeInteger(p.promotionalPriceCents) || p.promotionalPriceCents <= 0 || p.promotionalPriceCents > p.priceCents)) throw new ValidationError("Um produto precisa ter o preço revisado pela loja.");
    const unitPriceCents = productPrice(p);
    if (!Number.isSafeInteger(unitPriceCents) || unitPriceCents < 0 || (p.promotionalPriceCents !== null && p.promotionalPriceCents > p.priceCents)) throw new ValidationError("Um produto precisa ter o preço revisado pela loja.");
    return { productId: p.id, productName: p.name, unitPriceCents, quantity: item.quantity, subtotalCents: unitPriceCents * item.quantity };
  });
  const subtotalCents = items.reduce((sum, i) => sum + i.subtotalCents, 0);
  const totalCents = subtotalCents + deliveryFeeCents;
  if (!Number.isSafeInteger(totalCents) || totalCents > 10_000_000) throw new ValidationError("O valor do pedido excede o limite permitido.");
  return { items, subtotalCents, deliveryFeeCents, totalCents };
}
