import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidCpf, validateCustomer, validateCart, validateIdempotencyKey } from "../src/lib/validation";
import { calculateOrder } from "../src/lib/order-calculation";
import { orderMessage, whatsappUrl, type MessageOrder } from "../src/lib/whatsapp";
import { hasOrderAccess, hashToken } from "../src/lib/order-access";
import { allowOrderRequest } from "../src/lib/rate-limit";
const customer = { name: "Cliente de Teste", whatsapp: "(89) 99999-1234", cpf: "529.982.247-25", postalCode: "64500-000", street: "Rua de Teste", number: "12", complement: "", neighborhood: "Centro", city: "Oeiras", state: "PI", reference: "", privacyAccepted: true };
const product = { id: "one", name: "Produto teste", priceCents: 2500, promotionalPriceCents: 1990, stock: 5, active: true };
test("CPF verifies digits and rejects repeated, truncated and wrong check digits", () => {
  assert.equal(isValidCpf(customer.cpf), true);
  for (const cpf of ["11111111111", "00000000000", "52998224724", "5299822472"]) assert.equal(isValidCpf(cpf), false);
});
test("customer normalizes data and rejects invalid phone, state, CEP, missing privacy acceptance", () => {
  const result = validateCustomer(customer); assert.equal(result.whatsapp, "89999991234"); assert.equal(result.postalCode, "64500000");
  for (const patch of [{ name: "Cliente" }, { cpf: "123" }, { whatsapp: "00000000000" }, { state: "ZZ" }, { postalCode: "00000000" }, { privacyAccepted: false }, { street: "Rua\nMensagem" }]) assert.throws(() => validateCustomer({ ...customer, ...patch }));
});
test("cart rejects duplicate items and non-integer, negative, excessive quantities", () => {
  assert.deepEqual(validateCart([{ productId: "one", quantity: 1, priceCents: 1 }]), [{ productId: "one", quantity: 1 }]);
  for (const quantity of [0, -1, .5, 100, "1"]) assert.throws(() => validateCart([{ productId: "one", quantity }]));
  assert.throws(() => validateCart([])); assert.throws(() => validateCart([{ productId: "one", quantity: 1 }, { productId: "one", quantity: 1 }]));
});
test("calculation trusts registered promotional price and cent arithmetic", () => {
  const totals = calculateOrder([{ productId: "one", quantity: 3 }], [product], 500);
  assert.equal(totals.subtotalCents, 5970); assert.equal(totals.totalCents, 6470); assert.equal(totals.items[0].unitPriceCents, 1990);
  assert.equal(calculateOrder([{ productId: "one", quantity: 2 }], [{ ...product, promotionalPriceCents: null }], 500).totalCents, 5500);
});
test("calculation rejects missing, inactive, out-of-stock and mispriced products", () => {
  const cart = [{ productId: "one", quantity: 2 }];
  for (const products of [[], [{ ...product, active: false }], [{ ...product, stock: 1 }], [{ ...product, promotionalPriceCents: -1 }], [{ ...product, promotionalPriceCents: 9999 }]]) assert.throws(() => calculateOrder(cart, products, 500));
});
test("WhatsApp message uses order snapshots, encodes accents/newlines and never includes CPF or payment claims", () => {
  const order: MessageOrder = { orderNumber: "SOB-000123", subtotalCents: 3980, deliveryFeeCents: 500, totalCents: 4480,
    items: [{ productName: "Batom & cor", quantity: 2, unitPriceCents: 1990, subtotalCents: 3980 }], customer: { name: customer.name, whatsapp: "89999991234" },
    address: { street: customer.street, number: "12", neighborhood: "Centro", city: "Oeiras", state: "PI", postalCode: "64500000", complement: null, reference: "Próximo à praça" } };
  const text = orderMessage(order); const url = whatsappUrl(text, "5589994549682")!;
  assert.equal(new URL(url).searchParams.get("text"), text); assert.match(text, /2x Batom & cor/);
  assert.match(text, /44,80/); assert.doesNotMatch(text, /CPF|pago|PAID/i); assert.doesNotMatch(text, /Complemento:/);
  assert.equal(whatsappUrl(text, ""), null); assert.match(url, /^https:\/\/wa\.me\/5589994549682\?text=/);
});
test("order access requires exact private token; idempotency keys must be unpredictable UUIDs", () => {
  const token = "a".repeat(64); assert.equal(hasOrderAccess(token, hashToken(token)), true);
  assert.equal(hasOrderAccess("b".repeat(64), hashToken(token)), false); assert.equal(hasOrderAccess(undefined, hashToken(token)), false);
  assert.throws(() => validateIdempotencyKey("123"));
});
test("rate limit denies excessive requests and resets after the window", () => {
  for (let i = 0; i < 12; i++) assert.equal(allowOrderRequest("unit-test", 1000), true);
  assert.equal(allowOrderRequest("unit-test", 1000), false); assert.equal(allowOrderRequest("unit-test", 61001), true);
});
