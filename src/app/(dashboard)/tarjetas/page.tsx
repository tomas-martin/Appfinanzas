"use client";

import { useEffect, useState } from "react";
import { Trash2, CreditCard, Plus, Minus, ChevronLeft, CreditCard as CardIcon } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";
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
  const completadas = compras.filter((c) => c.cuotasPagadas >= c.cantidadCuotas);
  
  const totalPendiente = activas.reduce((s, c) => {
    const unitPrice = c.montoPorCuota * (c.moneda === "USD" ? (c.tipoCambio || 1) : 1);
    return s + (c.cantidadCuotas - c.cuotasPagadas) * unitPrice;
  }, 0);

  const cuotasMes = activas.reduce((s, c) => {
    const unitPrice = c.montoPorCuota * (c.moneda === "USD" ? (c.tipoCambio || 1) : 1);
    return s + unitPrice;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-8 pb-32 fade-in">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-surface-light/30 border border-white/5 text-muted hover:text-primary transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tight uppercase gradient-text">Tarjetas</h1>
        </div>
        <Link href="/nuevo" className="btn-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">+ Nueva</Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="glass-card p-6 bg-warning/5 border-warning/10">
          <p className="text-[10px] font-bold text-warning/70 uppercase tracking-[0.2em] mb-2">Total pendiente</p>
          <p className="text-2xl font-black text-warning tracking-tighter">{formatMoney(totalPendiente)}</p>
        </div>
        <div className="glass-card p-6 bg-danger/5 border-danger/10">
          <p className="text-[10px] font-bold text-danger/70 uppercase tracking-[0.2em] mb-2">Cuotas este mes</p>
          <p className="text-2xl font-black text-danger tracking-tighter">{formatMoney(cuotasMes)}</p>
        </div>
      </div>

      {/* Active purchases */}
      {activas.length === 0 && completadas.length === 0 ? (
        <div className="glass-card p-16 text-center border-dashed border-white/10 bg-transparent">
          <div className="w-20 h-20 bg-surface-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CardIcon className="w-10 h-10 text-muted/20" />
          </div>
          <p className="text-muted text-sm font-medium">No hay compras registradas</p>
          <Link href="/nuevo" className="text-primary text-sm font-bold mt-4 inline-block hover:underline">Registrar compra →</Link>
        </div>
      ) : (
        <>
          {activas.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xs font-black text-muted/50 uppercase tracking-[0.3em] mb-4 ml-1">Activas ({activas.length})</h2>
              <div className="space-y-4">
                {activas.map((c) => {
                  const progress = (c.cuotasPagadas / c.cantidadCuotas) * 100;
                  const unitPriceARS = c.montoPorCuota * (c.moneda === "USD" ? (c.tipoCambio || 1) : 1);
                  const restante = (c.cantidadCuotas - c.cuotasPagadas) * unitPriceARS;
                  
                  return (
                    <div key={c._id} className="glass-card p-6 hover:bg-surface-light/30 transition-all border-white/5 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black tracking-tight truncate">{c.descripcion}</p>
                          <p className="text-[11px] font-bold text-muted/60 uppercase tracking-widest mt-1">
                            {c.tarjeta} · {c.categoria} {c.tasaInteres > 0 ? ` · ${c.tasaInteres}% INT` : ""}
                          </p>
                        </div>
                        <button onClick={() => handleDelete(c._id)} className="p-2 rounded-xl text-muted/40 hover:text-danger hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{c.cuotasPagadas} de {c.cantidadCuotas} cuotas</span>
                          <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">%{Math.round(progress)}</span>
                        </div>
                        <div className="w-full bg-surface-light/50 rounded-full h-2 overflow-hidden">
                          <div className="bg-primary rounded-full h-2 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted/40 uppercase tracking-wider mb-1">Pendiente total</p>
                          <p className="text-base font-black text-warning tracking-tight">
                            {formatMoney(restante)}
                          </p>
                          {c.moneda === "USD" && (
                             <p className="text-[10px] font-medium text-muted/30 italic">Conversión a {formatMoney(c.tipoCambio || 0)}/USD</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDeshacer(c._id, c.cuotasPagadas)}
                            className="w-10 h-10 rounded-xl bg-surface-light/50 flex items-center justify-center text-muted hover:text-foreground transition-all border border-white/5 active:scale-90 disabled:opacity-20"
                            disabled={c.cuotasPagadas <= 0}>
                            <Minus className="w-5 h-5" />
                          </button>
                          <button onClick={() => handlePagar(c._id, c.cuotasPagadas)}
                            className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center text-white shadow-lg active:scale-90"
                            disabled={c.cuotasPagadas >= c.cantidadCuotas}>
                            <Plus className="w-5 h-5 stroke-[3px]" />
                          </button>
                        </div>
                      </div>

                      <p className="text-right text-[11px] font-black text-primary uppercase tracking-wider mt-4 p-2 rounded-lg bg-primary/5">
                        {formatMoney(c.montoPorCuota, c.moneda as "ARS" | "USD")} /cuota
                        {c.moneda === "USD" && (
                           <span className="text-muted/40 ml-1"> (≈ {formatMoney(unitPriceARS)})</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {completadas.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xs font-black text-muted/50 uppercase tracking-[0.3em] mb-4 ml-1">Completadas ✓</h2>
              <div className="space-y-3">
                {completadas.map((c) => (
                  <div key={c._id} className="glass-card p-5 opacity-50 flex items-center justify-between border-white/5 hover:opacity-100 transition-opacity group">
                    <div>
                      <p className="text-sm font-black tracking-tight">{c.descripcion}</p>
                      <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest mt-1">{c.tarjeta} · {c.cantidadCuotas} cuotas</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest">Finalizada</div>
                      <button onClick={() => handleDelete(c._id)} className="p-2 rounded-xl text-muted/40 hover:text-danger hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
