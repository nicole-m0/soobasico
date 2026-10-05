import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { receiptCookie, hasOrderAccess } from "@/lib/order-access";
import { Confirmation } from "@/components/confirmation";
export const metadata = { title: "Pedido criado", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\da-f-]{36}$/i.test(id)) notFound();
  const cookie = (await cookies()).get(receiptCookie(id))?.value;
  if (!cookie) notFound();
  const order = await prisma.order.findUnique({ where: { id }, select: {
    orderNumber: true, accessTokenHash: true, subtotalCents: true, deliveryFeeCents: true, totalCents: true,
    items: { select: { productName: true, quantity: true, unitPriceCents: true, subtotalCents: true } },
    customer: { select: { name: true, whatsapp: true } },
    address: { select: { street: true, number: true, neighborhood: true, city: true, state: true, postalCode: true, complement: true, reference: true } },
  } });
  if (!order || !hasOrderAccess(cookie, order.accessTokenHash)) notFound();
  const { accessTokenHash: _privateHash, ...receipt } = order;
  void _privateHash;
  return <Confirmation order={receipt} orderId={id} />;
}
