"use client";
import { useStore } from "./store-provider";
import { money, storeConfig } from "@/lib/store-config";
import { productPrice } from "@/lib/types";
export function OrderSummary({ showItems = false, children }: { showItems?: boolean; children?: React.ReactNode }) {
  const { lines, subtotal } = useStore(); const delivery = lines.length ? storeConfig.deliveryFeeCents : 0;
  return <aside className="order-summary"><span className="eyebrow">TUDO ESCOLHIDO POR VOCÊ</span><h2>Resumo do pedido</h2>{showItems && <div className="summary-items">{lines.map(({ product, quantity }) => <div key={product.id}><span>{quantity}× {product.name}</span><strong>{money(productPrice(product) * quantity)}</strong></div>)}</div>}<dl className="totals"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Taxa de entrega</dt><dd>{money(delivery)}</dd></div><div className="grand-total"><dt>Total</dt><dd>{money(subtotal + delivery)}</dd></div></dl><p className="summary-note">Entrega combinada pelo WhatsApp. Pagamento a confirmar com a loja.</p>{children}</aside>;
}
