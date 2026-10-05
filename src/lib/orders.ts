import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { storeConfig } from "./store-config";
import { validateCart, validateCustomer, validateIdempotencyKey, ValidationError } from "./validation";
import { calculateOrder } from "./order-calculation";
import { hashToken, receiptToken } from "./order-access";
export async function createOrder(input: unknown) {
  if (!input || typeof input !== "object") throw new ValidationError("Não foi possível ler o pedido.");
  const raw = input as Record<string, unknown>;
  const cart = validateCart(raw.items);
  const customer = validateCustomer(raw.customer);
  const key = validateIdempotencyKey(raw.idempotencyKey);
  const token = receiptToken(key);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const order = await prisma.$transaction(async tx => {
        const previous = await tx.order.findUnique({ where: { idempotencyKey: key } });
        if (previous) return previous;
        const products = await tx.product.findMany({ where: { id: { in: cart.map(i => i.productId) } } });
        const totals = calculateOrder(cart, products, storeConfig.deliveryFeeCents);
        // Atomic decrement plus serializable isolation prevents concurrent overselling.
        for (const item of totals.items) {
          const updated = await tx.product.updateMany({ where: { id: item.productId, active: true, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
          if (updated.count !== 1) throw new ValidationError(`${item.productName} acabou de ficar indisponível. Confira seu carrinho.`);
        }
        const person = await tx.customer.create({ data: { name: customer.name, whatsapp: customer.whatsapp, cpf: customer.cpf } });
        const address = await tx.address.create({ data: {
          customerId: person.id, postalCode: customer.postalCode, street: customer.street, number: customer.number,
          neighborhood: customer.neighborhood, city: customer.city, state: customer.state,
          complement: customer.complement || null, reference: customer.reference || null,
        } });
        const created = await tx.order.create({ data: {
          orderNumber: `TEMP-${randomUUID()}`, idempotencyKey: key, accessTokenHash: hashToken(token),
          customerId: person.id, addressId: address.id, subtotalCents: totals.subtotalCents,
          deliveryFeeCents: totals.deliveryFeeCents, totalCents: totals.totalCents,
          items: { create: totals.items },
        } });
        return tx.order.update({ where: { id: created.id }, data: { orderNumber: `SOB-${String(created.sequence).padStart(6, "0")}` } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 15000 });
      return { id: order.id, token };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2034", "P2002"].includes(error.code) && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error("Não foi possível criar o pedido.");
}
