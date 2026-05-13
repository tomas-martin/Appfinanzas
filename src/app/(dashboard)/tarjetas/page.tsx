"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ChevronLeft, CreditCard as CardIcon } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Compra {
  _id: string;
  descripcion: string;
  montoTotal: number;
  moneda: string;
  tipoCambio?: number;
  montoARS?: number;
  cantidadCuotas: number;
  cuotasPagadas: number;
  montoPorCuota: number;
  tasaInteres: number;
  tarjeta: string;
  fechaInicio: string;
  categoria: string;
}

export default function TarjetasPage() {
  const router = useRouter();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/compras");
      const data = await res.json();
      setCompras(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handlePagar(id: string, cuotasPagadas: number) {
    await fetch(`/api/compras/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cuotasPagadas: cuotasPagadas + 1 }),
    });
    fetchData();
  }

  async function handleDeshacer(id: string, cuotasPagadas: number) {
    if (cuotasPagadas <= 0) return;
    await fetch(`/api/compras/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cuotasPagadas: cuotasPagadas - 1 }),
    });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta compra?")) return;
    await fetch(`/api/compras/${id}`, { method: "DELETE" });
    setCompras((prev) => prev.filter((c) => c._id !== id));
  }

  const activas = compras.filter((c) => c.cuotasPagadas < c.cantidadCuotas);
  const totalPendiente = activas.reduce((s, c) => {
    const unitPrice = c.montoPorCuota * (c.moneda === "USD" ? (c.tipoCambio || 1420) : 1);
    return s + (c.cantidadCuotas - c.cuotasPagadas) * unitPrice;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile fade-in-up">
      <div className="flex items-center gap-5 mb-10">
        <button onClick={() => router.back()} className="p-4 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-extrabold tracking-tighter">Tarjetas</h1>
      </div>

      <div className="text-center mb-12">
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-3">Pendiente</p>
        <h2 className="text-4xl font-extrabold tracking-tighter">{formatMoney(totalPendiente)}</h2>
      </div>

      <div className="space-y-4">
        {activas.map((c) => {
          const unitPriceARS = c.montoPorCuota * (c.moneda === "USD" ? (c.tipoCambio || 1420) : 1);
          const restante = (c.cantidadCuotas - c.cuotasPagadas) * unitPriceARS;
          
          return (
            <div key={c._id} className="premium-card p-6 space-y-6 group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold tracking-tight mb-1">{c.descripcion}</h3>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{c.tarjeta} · {c.categoria}</p>
                </div>
                <button onClick={() => handleDelete(c._id)} className="p-2 text-muted/20 hover:text-danger active:scale-90 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                  <span className="text-white/60">Pago {c.cuotasPagadas}/{c.cantidadCuotas}</span>
                  <span className="text-muted">{formatMoney(c.montoPorCuota, c.moneda as any)}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000" style={{ width: `${(c.cuotasPagadas / c.cantidadCuotas) * 100}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-0.5">Resta</p>
                  <p className="text-lg font-bold">{formatMoney(restante)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDeshacer(c._id, c.cuotasPagadas)}
                    className="p-3 rounded-xl bg-[#111111] text-muted active:scale-90 transition-all disabled:opacity-10"
                    disabled={c.cuotasPagadas <= 0}>
                    <Minus className="w-4 h-4" />
                  </button>
                  <button onClick={() => handlePagar(c._id, c.cuotasPagadas)}
                    className="p-3 rounded-xl bg-white text-black active:scale-90 transition-all disabled:opacity-10"
                    disabled={c.cuotasPagadas >= c.cantidadCuotas}>
                    <Plus className="w-4 h-4 stroke-[3px]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {activas.length === 0 && (
          <div className="p-16 text-center">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Sin deudas activas</p>
          </div>
        )}
      </div>
    </div>
  );
}
