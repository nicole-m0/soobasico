import type { CartItem, CheckoutData } from "./types";
export class ValidationError extends Error {}
export const digits = (value: string) => value.replace(/\D/g, "");
export function isValidCpf(input: string): boolean {
  const value = digits(input);
  if (!/^\d{11}$/.test(value) || /^(\d)\1{10}$/.test(value)) return false;
  for (let size = 9; size <= 10; size++) {
    const sum = [...value.slice(0, size)].reduce((total, digit, i) => total + Number(digit) * (size + 1 - i), 0);
    const check = (sum * 10) % 11 % 10;
    if (check !== Number(value[size])) return false;
  }
  return true;
}
const states = new Set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));
export function validateCustomer(value: unknown): CheckoutData {
  if (!value || typeof value !== "object") throw new ValidationError("Preencha seus dados para continuar.");
  const raw = value as Record<string, unknown>;
  const text = (key: string, min: number, max: number, label: string) => {
    if (typeof raw[key] !== "string") throw new ValidationError(`Confira o campo ${label}.`);
    const str = (raw[key] as string).trim();
    if (str.length < min || str.length > max || /[\u0000-\u001f\u007f]/.test(str)) throw new ValidationError(`Confira o campo ${label}.`);
    return str;
  };
  const name = text("name", 3, 100, "nome completo");
  if (name.split(/\s+/).length < 2) throw new ValidationError("Informe seu nome completo.");
  const whatsapp = digits(text("whatsapp", 10, 22, "WhatsApp"));
  if (!/^[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/.test(whatsapp)) throw new ValidationError("Informe um telefone válido com DDD.");
  const cpf = digits(text("cpf", 11, 14, "CPF"));
  if (!isValidCpf(cpf)) throw new ValidationError("Confira o CPF informado.");
  const postalCode = digits(text("postalCode", 8, 9, "CEP"));
  if (!/^\d{8}$/.test(postalCode) || postalCode === "00000000") throw new ValidationError("Informe um CEP válido com 8 dígitos.");
  const state = text("state", 2, 2, "estado").toUpperCase();
  if (!states.has(state)) throw new ValidationError("Selecione um estado válido.");
  if (raw.privacyAccepted !== true) throw new ValidationError("Confirme a leitura das informações de privacidade.");
  return { name, whatsapp, cpf, postalCode, state,
    street: text("street", 2, 150, "rua"), number: text("number", 1, 15, "número"),
    complement: text("complement", 0, 100, "complemento"), neighborhood: text("neighborhood", 2, 100, "bairro"),
    city: text("city", 2, 100, "cidade"), reference: text("reference", 0, 150, "ponto de referência"), privacyAccepted: true,
  };
}
export function validateCart(value: unknown): CartItem[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) throw new ValidationError("Seu carrinho precisa ter entre 1 e 50 produtos.");
  const seen = new Set<string>();
  return value.map(item => {
    if (!item || typeof item !== "object" || typeof item.productId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || seen.has(item.productId)) throw new ValidationError("Confira os produtos e as quantidades do carrinho.");
    seen.add(item.productId);
    return { productId: item.productId, quantity: item.quantity };
  });
}
export function validateIdempotencyKey(key: unknown): string {
  if (typeof key !== "string" || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(key)) throw new ValidationError("Atualize a página e tente novamente.");
  return key;
}
