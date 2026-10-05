"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, MessageCircle, ArrowRight, Copy, Clock3 } from "lucide-react";
import { useStore } from "./store-provider";
import { orderMessage, whatsappUrl, type MessageOrder } from "@/lib/whatsapp";
import { money } from "@/lib/store-config";
export function Confirmation({ order, orderId }: { order: MessageOrder; orderId: string }) {
  const { clear, hydrated, toast } = useStore(); const cleared = useRef(false);
  useEffect(() => {
    if (hydrated && !cleared.current) {
      cleared.current = true;
      try { if (sessionStorage.getItem("sob-created-order") === orderId) { clear(); sessionStorage.removeItem("sob-created-order"); } } catch { /* Retain the cart if the creation marker cannot be verified. */ }
    }
  }, [clear, hydrated, orderId]);
  const message = orderMessage(order); const url = whatsappUrl(message);
  async function copy() { try { await navigator.clipboard.writeText(message); toast("Mensagem do pedido copiada."); } catch { toast("Não foi possível copiar. Selecione a mensagem abaixo para copiar manualmente."); } }
  return <div className="container confirmation-page"><div className="confirmation-icon"><Check size={32} /></div><span className="eyebrow">SEUS FAVORITOS, UM PASSO MAIS PERTO</span><h1>Seu pedido foi criado!</h1><p className="confirmation-intro">Para concluir o atendimento e combinar ou confirmar a entrega,<br className="desktop-break" /> envie seu pedido para a Só o Básico pelo WhatsApp.</p><div className="order-number">Pedido <strong>#{order.orderNumber}</strong><span><Clock3 size={14} />Aguardando confirmação</span></div>{url ? <a className="button whatsapp-button" href={url} target="_blank" rel="noopener noreferrer"><MessageCircle size={22} />Enviar pedido pelo WhatsApp <ArrowRight size={19} /></a> : <p role="alert" className="form-error">O WhatsApp da loja ainda não foi configurado. Copie a mensagem e entre em contato com a loja.</p>}<p className="confirmation-note">Seu pedido foi salvo. O pagamento ainda está pendente.<br />Abrir o WhatsApp não confirma automaticamente o envio da mensagem.</p><div className="confirmation-summary"><h2>O que vai na sua sacola</h2>{order.items.map((i, n) => <div className="confirmed-item" key={n}><span>{i.quantity}× {i.productName}</span><strong>{money(i.subtotalCents)}</strong></div>)}<dl className="totals"><div><dt>Subtotal</dt><dd>{money(order.subtotalCents)}</dd></div><div><dt>Taxa de entrega</dt><dd>{money(order.deliveryFeeCents)}</dd></div><div className="grand-total"><dt>Total do pedido</dt><dd>{money(order.totalCents)}</dd></div></dl><details className="message-preview"><summary>Ver mensagem do WhatsApp</summary><pre>{message}</pre><button className="text-link" onClick={copy}><Copy size={16} />Copiar mensagem</button></details></div><Link className="text-link" href="/produtos">Continuar explorando a loja <ArrowRight size={16} /></Link></div>;
}
