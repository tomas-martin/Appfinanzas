"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, X, ToggleLeft, ToggleRight, ChevronLeft, Calendar } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GF {
  _id: string;
  nombre: string;
  monto: number;
  moneda: string;
  tipoCambio?: number;
  montoARS?: number;
  diaVencimiento: number;
  categoria: string;
  activo: boolean;
}

export default function GastosFijosPage() {
  const router = useRouter();
  const [gastos, setGastos] = useState<GF[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<GF>>({});

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/gastos-fijos", { cache: "no-store" });
      const data = await res.json();
      setGastos(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleToggle(id: string, activo: boolean) {
    await fetch(`/api/gastos-fijos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este gasto fijo?")) return;
    await fetch(`/api/gastos-fijos/${id}`, { method: "DELETE" });
    setGastos((prev) => prev.filter((g) => g._id !== id));
  }

  async function handleEdit(id: string) {
    await fetch(`/api/gastos-fijos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditId(null);
    fetchData();
  }

  const totalActivoARS = gastos.filter((g) => g.activo).reduce((s, g) => {
    const amount = g.moneda === "USD" ? (g.montoARS || g.monto * (g.tipoCambio || 1420)) : g.monto;
    return s + amount;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-8 pb-36 fade-in">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 rounded-2xl bg-surface-light/30 border border-white/5 text-muted hover:text-primary transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tight uppercase gradient-text">Gastos Fijos</h1>
        </div>
        <Link href="/nuevo" className="btn-primary text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">+ Nuevo</Link>
      </div>

      {/* Total card */}
      <div className="glass-card p-8 mb-10 relative overflow-hidden group border-danger/10 bg-danger/[0.02]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-danger/10 rounded-full blur-[60px] -mr-24 -mt-24" />
        <p className="text-[10px] font-black text-danger/60 uppercase tracking-[0.3em] mb-3">Total mensual estimado (ARS)</p>
        <p className="text-4xl font-black text-danger tracking-tighter">{formatMoney(totalActivoARS)}</p>
        <div className="flex items-center gap-2 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">{gastos.filter((g) => g.activo).length} suscripciones activas</p>
        </div>
      </div>

      {gastos.length === 0 ? (
        <div className="glass-card p-20 text-center border-dashed border-white/10 bg-transparent">
          <div className="w-20 h-20 bg-surface-light/20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <Calendar className="w-10 h-10 text-muted/10" />
          </div>
          <p className="text-muted/40 text-xs font-black uppercase tracking-[0.2em]">Sin gastos registrados</p>
          <Link href="/nuevo" className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-6 inline-block hover:underline">Agregar uno →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {gastos.map((g) => (
            <div key={g._id} className={`glass-card p-5 transition-all border-white/5 group ${!g.activo ? "opacity-40 grayscale blur-[0.5px]" : ""}`}>
              {editId === g._id ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted/50 uppercase tracking-widest ml-1">Nombre del gasto</label>
                    <input type="text" value={editData.nombre ?? g.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                      className="w-full bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-muted/50 uppercase tracking-widest ml-1">Monto</label>
                      <input type="number" value={editData.monto ?? g.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                        className="w-full bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none" />
                    </div>
                    <div className="w-28 space-y-2">
                      <label className="text-[10px] font-black text-muted/50 uppercase tracking-widest ml-1">Día</label>
                      <input type="number" value={editData.diaVencimiento ?? g.diaVencimiento} onChange={(e) => setEditData({ ...editData, diaVencimiento: Number(e.target.value) })}
                        min="1" max="31" className="w-full bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none" placeholder="Día" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleEdit(g._id)} className="flex-1 btn-primary text-white text-[10px] py-4 rounded-2xl font-black uppercase tracking-[0.2em]">Guardar</button>
                    <button onClick={() => setEditId(null)} className="px-5 bg-surface-light/50 text-muted text-xs py-4 rounded-2xl border border-white/5"><X className="w-5 h-5" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => handleToggle(g._id, g.activo)} className="shrink-0 transition-all active:scale-90 relative">
                    {g.activo ? 
                      <div className="p-1 rounded-full bg-primary/20"><ToggleRight className="w-10 h-10 text-primary" /></div> : 
                      <div className="p-1 rounded-full bg-surface-light/50"><ToggleLeft className="w-10 h-10 text-muted/30" /></div>
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black tracking-tight truncate">{g.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Día {g.diaVencimiento}</p>
                      <span className="w-1 h-1 rounded-full bg-muted/20" />
                      <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest">{g.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-foreground tracking-tighter">
                      {formatMoney(g.monto, g.moneda as "ARS" | "USD")}
                    </p>
                    {g.moneda === "USD" && (g.montoARS || g.tipoCambio) && (
                       <p className="text-[10px] font-bold text-muted/30 mt-0.5">
                         ≈ {formatMoney(g.montoARS || g.monto * (g.tipoCambio || 1420))}
                       </p>
                    )}
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button onClick={() => { setEditId(g._id); setEditData({ nombre: g.nombre, monto: g.monto, diaVencimiento: g.diaVencimiento }); }}
                        className="p-2 rounded-lg bg-white/5 text-muted/40 hover:text-primary hover:bg-primary/10 transition-all border border-white/5"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(g._id)}
                        className="p-2 rounded-lg bg-white/5 text-muted/40 hover:text-danger hover:bg-danger/10 transition-all border border-white/5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
