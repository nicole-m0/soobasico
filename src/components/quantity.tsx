"use client";
import { Minus, Plus } from "lucide-react";
export function Quantity({ value, max, onChange, label }: { value: number; max: number; onChange: (n: number) => void; label: string }) {
  return <div className="quantity"><button type="button" aria-label={`Diminuir quantidade de ${label}`} disabled={value <= 1} onClick={() => onChange(value - 1)}><Minus size={15} /></button><span aria-label={`Quantidade de ${label}`}>{value}</span><button type="button" aria-label={`Aumentar quantidade de ${label}`} disabled={value >= Math.min(max, 99)} onClick={() => onChange(value + 1)}><Plus size={15} /></button></div>;
}
