"use client";

import { useEffect, useState } from "react";
import { Trash2, CreditCard, Plus, Minus } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";

interface Compra {
  _id: string;
  descripcion: string;
  montoTotal: number;
  moneda: string;
  cantidadCuotas: number;
  cuotasPagadas: number;
  montoPorCuota: number;
  tasaInteres: number;
  tarjeta: string;
  fechaInicio: string;
  categoria: string;
}

export default function TarjetasPage() {
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
  const totalPendiente = activas.reduce((s, c) => s + (c.cantidadCuotas - c.cuotasPagadas) * c.montoPorCuota, 0);
  const cuotasMes = activas.reduce((s, c) => s + c.montoPorCuota, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Tarjetas</h1>
        <Link href="/nuevo" className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium">+ Nueva</Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="glass-card p-4">
          <p className="text-xs text-muted mb-1">Total pendiente</p>
          <p className="text-xl font-bold text-warning">{formatMoney(totalPendiente)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted mb-1">Cuotas este mes</p>
          <p className="text-xl font-bold text-danger">{formatMoney(cuotasMes)}</p>
        </div>
      </div>

      {/* Active purchases */}
      {activas.length === 0 && completadas.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <CreditCard className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">No hay compras en cuotas</p>
          <Link href="/nuevo" className="text-primary text-sm mt-2 inline-block">Agregar una →</Link>
        </div>
      ) : (
        <>
          {activas.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3 text-muted">Activas ({activas.length})</h2>
              <div className="space-y-2">
                {activas.map((c) => {
                  const progress = (c.cuotasPagadas / c.cantidadCuotas) * 100;
                  const restante = (c.cantidadCuotas - c.cuotasPagadas) * c.montoPorCuota;
                  return (
                    <div key={c._id} className="glass-card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{c.descripcion}</p>
                          <p className="text-[10px] text-muted">{c.tarjeta} · {c.categoria}{c.tasaInteres > 0 ? ` · ${c.tasaInteres}% interés` : " · Sin interés"}</p>
                        </div>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg text-muted hover:text-danger transition-colors ml-2">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-surface-light rounded-full h-2 mb-2">
                        <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted">{c.cuotasPagadas}/{c.cantidadCuotas} cuotas</span>
                          <span className="text-xs text-muted ml-2">· Resta: <span className="text-warning font-medium">{formatMoney(restante, c.moneda as "ARS" | "USD")}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDeshacer(c._id, c.cuotasPagadas)}
                            className="w-7 h-7 rounded-lg bg-surface-light flex items-center justify-center text-muted hover:text-foreground transition-colors disabled:opacity-30"
                            disabled={c.cuotasPagadas <= 0}>
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handlePagar(c._id, c.cuotasPagadas)}
                            className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
                            disabled={c.cuotasPagadas >= c.cantidadCuotas}>
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-right text-sm font-semibold text-foreground mt-1">
                        {formatMoney(c.montoPorCuota, c.moneda as "ARS" | "USD")} /cuota
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {completadas.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3 text-muted">Completadas ✓</h2>
              <div className="space-y-2">
                {completadas.map((c) => (
                  <div key={c._id} className="glass-card p-3.5 opacity-60 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{c.descripcion}</p>
                      <p className="text-[10px] text-muted">{c.tarjeta} · {c.cantidadCuotas} cuotas pagadas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-success font-medium">✓ Pagada</p>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
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
