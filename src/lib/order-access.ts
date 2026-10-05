import { createHash, createHmac, timingSafeEqual } from "node:crypto";
export function receiptToken(key: string) {
  const secret = process.env.ORDER_ACCESS_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith("replace-")) throw new Error("Configure ORDER_ACCESS_SECRET com pelo menos 32 caracteres aleatórios.");
  return createHmac("sha256", secret).update(key).digest("hex");
}
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export function hasOrderAccess(token: string | undefined, expectedHash: string) {
  if (!token || !/^[a-f0-9]{64}$/.test(token) || !/^[a-f0-9]{64}$/.test(expectedHash)) return false;
  return timingSafeEqual(Buffer.from(hashToken(token), "hex"), Buffer.from(expectedHash, "hex"));
}
export const receiptCookie = (id: string) => `sob-receipt-${id}`;
