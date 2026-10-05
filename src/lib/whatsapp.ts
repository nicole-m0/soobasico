import { money, storeConfig } from "./store-config";
export type MessageOrder = {
  orderNumber: string; subtotalCents: number; deliveryFeeCents: number; totalCents: number;
  items: { productName: string; quantity: number; unitPriceCents: number; subtotalCents: number }[];
  customer: { name: string; whatsapp: string };
  address: { street: string; number: string; neighborhood: string; city: string; state: string; postalCode: string; complement: string | null; reference: string | null };
};
export function orderMessage(order: MessageOrder): string {
  const { customer: c, address: a } = order;
  return [
    "Olá! Estou finalizando meu pedido na Só o Básico.", "", `Pedido: #${order.orderNumber}`, "", "Itens:", "",
    ...order.items.flatMap(i => [`• ${i.quantity}x ${i.productName}`, `  ${money(i.subtotalCents)} (${money(i.unitPriceCents)} por unidade)`, ""]),
    `Subtotal: ${money(order.subtotalCents)}`, `Taxa de entrega: ${money(order.deliveryFeeCents)}`, `Total: ${money(order.totalCents)}`,
    "", "DADOS PARA ENTREGA", "", `Nome: ${c.name}`, `WhatsApp: ${c.whatsapp}`, "", "Endereço:",
    `${a.street}, ${a.number}`, a.neighborhood, `${a.city} - ${a.state}`, `CEP: ${a.postalCode.replace(/(\d{5})(\d{3})/, "$1-$2")}`,
    ...(a.complement ? [`Complemento: ${a.complement}`] : []), ...(a.reference ? [`Referência: ${a.reference}`] : []),
    "", "Aguardo a confirmação do meu pedido. Obrigada!",
  ].join("\n");
}
export function whatsappUrl(message: string, phone = storeConfig.whatsapp): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!/^[1-9]\d{9,14}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
