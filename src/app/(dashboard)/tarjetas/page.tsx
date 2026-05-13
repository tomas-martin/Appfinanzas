"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ChevronLeft, CreditCard as CardIcon } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Pago {
  mes: number;
  anio: number;
}

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
  pagos?: Pago[];
}

const MESES_SHORT = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function TarjetasPage() {
  const router = useRouter();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/compras", { cache: "no-store" });
      const data = await res.json();
      setCompras(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleTogglePago(id: string, mes: number, anio: number) {
    await fetch(`/api/compras/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagoMes: mes, pagoAnio: anio }),
    });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta compra?")) return;
    await fetch(`/api/compras/${id}`, { method: "DELETE" });
    setCompras((prev) => prev.filter((c) => c._id !== id));
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const activas = compras.filter((c) => (c.cuotasPagadas || 0) < c.cantidadCuotas);
  const totalPendiente = activas.reduce((s, c) => {
    const unitPrice = c.montoPorCuota * (c.moneda === "USD" ? (c.tipoCambio || 1420) : 1);
    return s + (c.cantidadCuotas - (c.cuotasPagadas || 0)) * unitPrice;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
        <Link href="/nuevo" className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl active:scale-90 transition-all">
          <Plus className="w-6 h-6 stroke-[3px]" />
        </Link>
      </div>

      <div className="text-center mb-12">
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-3">Capital Pendiente</p>
        <h2 className="text-4xl font-extrabold tracking-tighter text-primary">{formatMoney(totalPendiente)}</h2>
      </div>

      <div className="space-y-4">
        {activas.map((c) => {
          const unitPriceARS = c.montoPorCuota * (c.moneda === "USD" ? (c.tipoCambio || 1420) : 1);
          const restante = (c.cantidadCuotas - (c.cuotasPagadas || 0)) * unitPriceARS;
          
          const startDate = new Date(c.fechaInicio);
          const startMonth = startDate.getMonth();
          const startYear = startDate.getFullYear();

          return (
            <div key={c._id} className="premium-card p-6 space-y-6 group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold tracking-tight mb-1">{c.descripcion}</h3>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{c.tarjeta} · Día {c.diaVencimiento} · {c.categoria}</p>
                </div>
                <button onClick={() => handleDelete(c._id)} className="p-2 text-muted/20 hover:text-danger active:scale-90 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                  <span className="text-indigo-400">Cuota {c.cuotasPagadas || 0}/{c.cantidadCuotas}</span>
                  <span className="text-muted">{formatMoney(c.montoPorCuota, c.moneda as any)}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${((c.cuotasPagadas || 0) / c.cantidadCuotas) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-0.5">Resta Total</p>
                    <p className="text-lg font-bold">{formatMoney(restante)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-muted/40 uppercase tracking-widest">Inicia: {startDate.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex gap-1 overflow-x-auto no-scrollbar pt-2">
                  {MESES_SHORT.map((m, i) => {
                    const isPaid = c.pagos?.some((p) => p.mes === i && p.anio === currentYear);
                    const isCurrent = i === currentMonth;
                    
                    // Bloqueo de meses antes del inicio de la deuda
                    const isBeforeStart = (currentYear < startYear) || (currentYear === startYear && i < startMonth);
                    const isAfterLimit = (currentYear > startYear + Math.ceil(c.cantidadCuotas / 12)) || (c.cuotasPagadas >= c.cantidadCuotas && !isPaid);

                    return (
                      <button key={i} onClick={() => !isBeforeStart && handleTogglePago(c._id, i, currentYear)}
                        disabled={isBeforeStart}
                        className={`month-dot ${
                          isPaid ? "bg-success text-black border-success shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
                          isCurrent ? "bg-white/10 text-white border-white/20" : 
                          isBeforeStart ? "opacity-10 cursor-not-allowed" :
                          "bg-[#111111] text-muted/30"
                        }`}>
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {activas.length === 0 && (
          <div className="p-16 text-center border border-dashed border-white/5 rounded-3xl">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Sin deudas activas</p>
          </div>
        )}
      </div>
    </div>
  );
}
