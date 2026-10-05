function deliveryFee(): number {
  const value = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE_CENTS ?? "500");
  if (!Number.isSafeInteger(value) || value < 0 || value > 100_000) throw new Error("Taxa de entrega inválida na configuração.");
  return value;
}
export const storeConfig = {
  name: "Só o Básico",
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "",
  deliveryFeeCents: deliveryFee(),
  pickupEnabled: false,
};
export const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
