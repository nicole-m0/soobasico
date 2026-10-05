import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../../src/lib/prisma";
import { createOrder } from "../../src/lib/orders";
import { hasOrderAccess } from "../../src/lib/order-access";
const runId = randomUUID();
const keys: string[] = []; const productIds: string[] = []; let categoryId = ""; let brandId = "";
const customer = { name: "Cliente Teste Automatizado", whatsapp: "89999991234", cpf: "52998224725", postalCode: "64500000", street: "Rua Fictícia", number: "1", complement: "", neighborhood: "Centro", city: "Oeiras", state: "PI", reference: "", privacyAccepted: true };
async function setup(stock: number) {
  const category = await prisma.category.upsert({ where: { slug: `test-${runId}` }, update: {}, create: { name: "Teste automatizado", slug: `test-${runId}` } }); categoryId = category.id;
  const brand = await prisma.brand.upsert({ where: { slug: `test-${runId}` }, update: {}, create: { name: "Teste automatizado", slug: `test-${runId}` } }); brandId = brand.id;
  const product = await prisma.product.create({ data: { name: "Produto fictício para teste", slug: `test-${randomUUID()}`, description: "Apenas teste", priceCents: 2500, promotionalPriceCents: 1990, stock, categoryId, brandId } }); productIds.push(product.id); return product;
}
function input(id: string, quantity = 1) { const idempotencyKey = randomUUID(); keys.push(idempotencyKey); return { customer, items: [{ productId: id, quantity, unitPriceCents: 1 }], idempotencyKey, totalCents: 1, paymentStatus: "PAID" }; }
test("real PostgreSQL: ignores manipulated totals, persists snapshots, pending statuses and idempotency", async () => {
  const product = await setup(10); const request = input(product.id, 2);
  const result = await createOrder(request); const duplicate = await createOrder(request);
  assert.equal(duplicate.id, result.id);
  const order = await prisma.order.findUniqueOrThrow({ where: { id: result.id }, include: { items: true } });
  assert.equal(order.totalCents, 4480); assert.equal(order.subtotalCents, 3980); assert.equal(order.paymentStatus, "PENDING"); assert.equal(order.status, "PENDING");
  assert.match(order.orderNumber, /^SOB-\d{6,}$/); assert.equal(hasOrderAccess(result.token, order.accessTokenHash), true);
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock, 8);
  await prisma.product.update({ where: { id: product.id }, data: { priceCents: 9000, promotionalPriceCents: null } });
  const snapshot = await prisma.orderItem.findFirstOrThrow({ where: { orderId: result.id } }); assert.equal(snapshot.unitPriceCents, 1990);
});
test("real PostgreSQL: concurrent orders cannot reserve the last item twice", async () => {
  const product = await setup(1);
  const results = await Promise.allSettled([createOrder(input(product.id)), createOrder(input(product.id))]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock, 0);
});
test("real PostgreSQL: failure rolls back earlier stock reservations", async () => {
  const first = await setup(3); const unavailable = await setup(0); const request = input(first.id);
  request.items.push({ productId: unavailable.id, quantity: 1, unitPriceCents: 1 });
  await assert.rejects(createOrder(request));
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: first.id } })).stock, 3);
  assert.equal(await prisma.order.count({ where: { idempotencyKey: request.idempotencyKey } }), 0);
});
after(async () => {
  // Only rows created by this test run are cleaned up. Never touch store data.
  const orders = await prisma.order.findMany({ where: { idempotencyKey: { in: keys } }, select: { id: true, customerId: true, addressId: true } });
  await prisma.order.deleteMany({ where: { id: { in: orders.map(o => o.id) } } });
  await prisma.address.deleteMany({ where: { id: { in: orders.map(o => o.addressId) } } });
  await prisma.customer.deleteMany({ where: { id: { in: orders.map(o => o.customerId) } } });
  await prisma.product.deleteMany({ where: { id: { in: productIds } } });
  if (categoryId) await prisma.category.delete({ where: { id: categoryId } });
  if (brandId) await prisma.brand.delete({ where: { id: brandId } });
  await prisma.$disconnect();
});
