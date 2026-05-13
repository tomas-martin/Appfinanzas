"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ChevronLeft, CreditCard as CardIcon, CheckCircle2, Circle } from "lucide-react";
import { formatMoney, formatDateShort } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  diaVencimiento: number;
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
    <div className="container-mobile fade-up">
      <div className="flex items-center justify-between mt-4 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3.5 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tighter">Tarjetas</h1>
        </div>
        <Link href="/nuevo" className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-90 transition-all">
          <Plus className="w-6 h-6 stroke-[3px]" />
        </Link>
      </div>

      <div className="text-center mb-12">
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-3">Capital Pendiente</p>
        <h2 className="text-4xl font-extrabold tracking-tighter">{formatMoney(totalPendiente)}</h2>
      </div>

      <div className="space-y-4">
        {activas.map((c) => {
          const unitPriceARS = c.montoPorCuota * (c.moneda === "USD" ? (c.tipoCambio || 1420) : 1);
          const restante = (c.cantidadCuotas - c.cuotasPagadas) * unitPriceARS;
          
          // Logic to determine if this month's installment is "paid" is simplified
          // by using cuotasPagadas relative to the start date
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const startDate = new Date(c.fechaInicio);
          const monthsSinceStart = (currentYear - startDate.getFullYear()) * 12 + (currentMonth - startDate.getMonth());
          const isPaidThisMonth = c.cuotasPagadas > monthsSinceStart;

          return (
            <div key={c._id} className="premium-card p-6 space-y-6 group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold tracking-tight">{c.descripcion}</h3>
                    {isPaidThisMonth ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <Circle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{c.tarjeta} · Día {c.diaVencimiento} · {c.categoria}</p>
                </div>
                <button onClick={() => handleDelete(c._id)} className="p-2 text-muted/20 hover:text-danger active:scale-90 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                  <span className="text-white/60">Cuota {c.cuotasPagadas}/{c.cantidadCuotas}</span>
                  <span className="text-muted">{formatMoney(c.montoPorCuota, c.moneda as any)}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000" style={{ width: `${(c.cuotasPagadas / c.cantidadCuotas) * 100}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-0.5">Pendiente</p>
                  <p className="text-lg font-bold">{formatMoney(restante)}</p>
                  <p className="text-[8px] font-bold text-muted/40 uppercase tracking-widest mt-1">Inicio: {new Date(c.fechaInicio).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDeshacer(c._id, c.cuotasPagadas)}
                    className="p-3 rounded-xl bg-[#111111] text-muted active:scale-90 transition-all disabled:opacity-10"
                    disabled={c.cuotasPagadas <= 0}>
                    <Minus className="w-4 h-4" />
                  </button>
                  <button onClick={() => handlePagar(c._id, c.cuotasPagadas)}
                    className={`p-3 rounded-xl active:scale-90 transition-all disabled:opacity-10 flex items-center gap-2 ${isPaidThisMonth ? "bg-success/20 text-success" : "bg-white text-black"}`}
                    disabled={c.cuotasPagadas >= c.cantidadCuotas}>
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{isPaidThisMonth ? "Pagado" : "Pagar"}</span>
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
