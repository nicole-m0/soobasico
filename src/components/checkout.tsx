"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, MapPin, UserRound, ShoppingBag, LoaderCircle } from "lucide-react";
import { useStore } from "./store-provider";
import { OrderSummary } from "./order-summary";
import { Modal } from "./modal";
import { validateCustomer } from "@/lib/validation";
import { money, storeConfig } from "@/lib/store-config";
import type { CheckoutData } from "@/lib/types";
const initial: CheckoutData = { name: "", whatsapp: "", cpf: "", postalCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "PI", reference: "", privacyAccepted: false };
const fields: { key: keyof Omit<CheckoutData, "privacyAccepted">; label: string; placeholder: string; autoComplete: string; numeric?: boolean; maxLength: number; optional?: boolean; full?: boolean }[] = [
  { key: "name", label: "Nome completo", placeholder: "Como podemos chamar você?", autoComplete: "name", maxLength: 100, full: true },
  { key: "whatsapp", label: "WhatsApp com DDD", placeholder: "(89) 99999-9999", autoComplete: "tel-national", numeric: true, maxLength: 15 },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00", autoComplete: "off", numeric: true, maxLength: 14 },
  { key: "postalCode", label: "CEP", placeholder: "00000-000", autoComplete: "postal-code", numeric: true, maxLength: 9 },
  { key: "street", label: "Rua", placeholder: "Nome da rua ou avenida", autoComplete: "address-line1", maxLength: 150, full: true },
  { key: "number", label: "Número", placeholder: "Número ou S/N", autoComplete: "off", maxLength: 15 },
  { key: "complement", label: "Complemento", placeholder: "Apartamento, bloco…", autoComplete: "address-line2", maxLength: 100, optional: true },
  { key: "neighborhood", label: "Bairro", placeholder: "Seu bairro", autoComplete: "address-level3", maxLength: 100 },
  { key: "city", label: "Cidade", placeholder: "Sua cidade", autoComplete: "address-level2", maxLength: 100 },
  { key: "reference", label: "Ponto de referência", placeholder: "Algo que ajude a encontrar você", autoComplete: "off", maxLength: 150, optional: true, full: true },
];
function mask(key: string, value: string) {
  const n = value.replace(/\D/g, "");
  if (key === "cpf") return n.slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  if (key === "postalCode") return n.slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  if (key === "whatsapp") return n.slice(0, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  return value;
}
export function Checkout() {
  const store = useStore(); const router = useRouter();
  const [data, setData] = useState(initial); const [error, setError] = useState("");
  const [review, setReview] = useState(false); const [loading, setLoading] = useState(false);
  const key = useRef<string | null>(null); const submitting = useRef(false);
  if (!store.hydrated) return <div className="container loading-state">Carregando seu pedido…</div>;
  if (!store.lines.length) return <div className="container empty-state"><ShoppingBag size={44} strokeWidth={1.3} /><h1>Sua sacola está vazia</h1><p>Escolha seus produtos antes de finalizar.</p><Link className="button primary" href="/produtos">Explorar catálogo <ArrowRight size={17} /></Link></div>;
  const unavailable = store.lines.some(i => !i.product.active || i.quantity > i.product.stock);
  const input = (f: typeof fields[number]) => <label key={f.key} className={`input-label ${f.full ? "field-full" : ""}`}>{f.label}{f.optional && <span className="optional"> (opcional)</span>}<input name={f.key} value={data[f.key]} onChange={e => setData(prev => ({ ...prev, [f.key]: f.numeric ? mask(f.key, e.target.value) : e.target.value }))} required={!f.optional} type={f.key === "whatsapp" ? "tel" : "text"} inputMode={f.numeric ? "numeric" : "text"} autoComplete={f.autoComplete} maxLength={f.maxLength} placeholder={f.placeholder} /></label>;
  function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try { validateCustomer(data); if (unavailable) throw new Error("Confira a disponibilidade dos produtos no carrinho antes de continuar."); setReview(true); }
    catch (err) { setError(err instanceof Error ? err.message : "Confira os dados do pedido."); }
  }
  async function submit() {
    if (submitting.current) return;
    submitting.current = true; setLoading(true); setError("");
    key.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/pedidos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer: data, items: store.items, idempotencyKey: key.current }) });
      const body: { orderId?: string; error?: string } = await response.json();
      if (!response.ok || !body.orderId) throw new Error(body.error ?? "Não foi possível criar o pedido. Tente novamente.");
      try { sessionStorage.setItem("sob-created-order", body.orderId); } catch { /* Private browsing may disable storage. */ }
      // Only confirmation clears the cart, after the persisted order can be accessed.
      router.push(`/pedidos/${body.orderId}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível conectar. Seu carrinho foi mantido."); setLoading(false); submitting.current = false; }
  }
  return <div className="container page-space checkout-page"><Link className="text-link" href="/carrinho"><ArrowLeft size={16} />Voltar à sacola</Link><div className="checkout-steps"><span><Check size={14} />Sacola</span><i /><span className="current">2 <b>Seus dados</b></span><i /><span>3 <b>Confirmação</b></span></div><div className="page-title"><span className="eyebrow">FALTA POUCO PARA SEUS FAVORITOS</span><h1>Vamos finalizar seu pedido?</h1><p>Informe seus dados. A entrega e o pagamento serão combinados com a loja.</p></div><form onSubmit={prepare} className="checkout-layout"><div className="checkout-fields"><section className="form-section"><h2><UserRound size={21} />Sobre você</h2><div className="form-grid">{fields.slice(0, 3).map(input)}</div><p className="input-hint">Seu CPF fica no registro do pedido e não será incluído na mensagem do WhatsApp.</p></section><section className="form-section"><h2><MapPin size={21} />Onde entregamos?</h2><span className="delivery-choice"><Check size={15} />Entrega no endereço informado</span><div className="form-grid">{fields.slice(3, -1).map(input)}<label className="input-label">Estado<select name="state" value={data.state} onChange={e => setData(prev => ({ ...prev, state: e.target.value }))}>{"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ").map(uf => <option key={uf}>{uf}</option>)}</select></label>{input(fields.at(-1)!)}</div></section><label className="privacy-choice"><input type="checkbox" required checked={data.privacyAccepted} onChange={e => setData(prev => ({ ...prev, privacyAccepted: e.target.checked }))} /><span>Li as <Link href="/privacidade" target="_blank">informações de privacidade</Link> e entendo como meus dados serão usados para atender este pedido.</span></label><p className="secure-note"><LockKeyhole size={15} />Seus dados são usados para este pedido e para a entrega.</p></div><OrderSummary showItems>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" disabled={unavailable || loading} className="button primary full">Revisar e confirmar pedido <ArrowRight size={17} /></button><Link className="text-link summary-back" href="/carrinho">Editar minha sacola</Link></OrderSummary></form><Modal open={review} onClose={() => { if (!loading) setReview(false); }} title="Tudo certo com seu pedido?"><p className="review-intro">Confira os dados antes de criar seu pedido.</p><div className="review-address"><strong>{data.name}</strong><span>{data.whatsapp}</span><span>{data.street}, {data.number}</span><span>{data.neighborhood} · {data.city} / {data.state}</span><span>CEP {data.postalCode}</span>{data.complement && <span>{data.complement}</span>}{data.reference && <span>Referência: {data.reference}</span>}</div><div className="review-total"><span>Total com entrega</span><strong>{money(store.subtotal + storeConfig.deliveryFeeCents)}</strong></div><p className="summary-note">O pedido será registrado como pendente. Depois, envie a mensagem pelo WhatsApp para confirmar o atendimento e combinar o pagamento.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button primary full" disabled={loading} onClick={submit}>{loading ? <><LoaderCircle className="spin" size={18} />Salvando seu pedido…</> : <>Confirmar e criar pedido <ArrowRight size={17} /></>}</button><button className="button secondary full review-back" disabled={loading} onClick={() => setReview(false)}>Voltar e editar dados</button></Modal></div>;
}
