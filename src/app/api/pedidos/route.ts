import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createOrder } from "@/lib/orders";
import { receiptCookie } from "@/lib/order-access";
import { allowOrderRequest } from "@/lib/rate-limit";
import { ValidationError } from "@/lib/validation";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const origin = process.env.APP_ORIGIN ?? request.nextUrl.origin;
  if (request.headers.get("origin") !== origin || request.headers.get("sec-fetch-site") === "cross-site") return NextResponse.json({ error: "Atualize a página para enviar seu pedido com segurança." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Formato de pedido inválido." }, { status: 415 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = createHash("sha256").update(ip).digest("hex");
  if (!allowOrderRequest(key)) return NextResponse.json({ error: "Aguarde um minuto antes de tentar novamente." }, { status: 429, headers: { "Retry-After": "60" } });
  try {
    // Read a bounded body, rather than allocating an unbounded JSON payload.
    if (Number(request.headers.get("content-length") ?? 0) > 16_384) return NextResponse.json({ error: "Pedido muito grande." }, { status: 413 });
    const reader = request.body?.getReader();
    if (!reader) throw new ValidationError("O pedido está vazio.");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 16_384) { await reader.cancel(); return NextResponse.json({ error: "Pedido muito grande." }, { status: 413 }); }
      chunks.push(value);
    }
    const input: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const order = await createOrder(input);
    const response = NextResponse.json({ orderId: order.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
    response.cookies.set(receiptCookie(order.id), order.token, { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", path: `/pedidos/${order.id}`, maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Não foi possível ler seu pedido. Tente novamente." }, { status: 400 });
    // Never log request bodies, customer data or ORM errors containing query parameters.
    return NextResponse.json({ error: "Não foi possível salvar seu pedido agora. Seus produtos continuam no carrinho. Tente novamente em instantes." }, { status: 503 });
  }
}
