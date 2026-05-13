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
      const res = await fetch("/api/gastos-fijos");
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
    <div className="container-mobile pt-8 pb-32 fade-in">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-surface-light/30 border border-white/5 text-muted hover:text-primary transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tight uppercase gradient-text">Gastos Fijos</h1>
        </div>
        <Link href="/nuevo" className="btn-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">+ Nuevo</Link>
      </div>

      {/* Total card */}
      <div className="glass-card p-6 mb-10 relative overflow-hidden group border-danger/10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-danger/5 rounded-full blur-2xl -mr-12 -mt-12" />
        <p className="text-[10px] font-bold text-danger/70 uppercase tracking-[0.2em] mb-2">Total mensual estimado (ARS)</p>
        <p className="text-3xl font-black text-danger tracking-tighter">{formatMoney(totalActivoARS)}</p>
        <p className="text-[11px] font-bold text-muted/40 mt-2 uppercase tracking-wider">{gastos.filter((g) => g.activo).length} gastos activos este mes</p>
      </div>

      {gastos.length === 0 ? (
        <div className="glass-card p-16 text-center border-dashed border-white/10 bg-transparent">
          <div className="w-20 h-20 bg-surface-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-muted/20" />
          </div>
          <p className="text-muted text-sm font-medium">No hay gastos fijos registrados</p>
          <Link href="/nuevo" className="text-primary text-sm font-bold mt-4 inline-block hover:underline">Agregar uno →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {gastos.map((g) => (
            <div key={g._id} className={`glass-card p-5 transition-all hover:bg-surface-light/30 border-white/5 group ${!g.activo ? "opacity-40 grayscale" : ""}`}>
              {editId === g._id ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <input type="text" value={editData.nombre ?? g.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                    className="w-full bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none" />
                  <div className="flex gap-3">
                    <input type="number" value={editData.monto ?? g.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                      className="flex-1 bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none" />
                    <input type="number" value={editData.diaVencimiento ?? g.diaVencimiento} onChange={(e) => setEditData({ ...editData, diaVencimiento: Number(e.target.value) })}
                      min="1" max="31" className="w-24 bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none" placeholder="Día" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(g._id)} className="flex-1 btn-primary text-white text-xs py-3 rounded-xl font-bold uppercase tracking-widest">Guardar</button>
                    <button onClick={() => setEditId(null)} className="px-4 bg-surface-light/50 text-muted text-xs py-3 rounded-xl border border-white/5"><X className="w-5 h-5" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => handleToggle(g._id, g.activo)} className="shrink-0 transition-transform active:scale-90">
                    {g.activo ? 
                      <div className="p-1 rounded-full bg-primary/20"><ToggleRight className="w-8 h-8 text-primary" /></div> : 
                      <div className="p-1 rounded-full bg-surface-light"><ToggleLeft className="w-8 h-8 text-muted" /></div>
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black tracking-tight truncate">{g.nombre}</p>
                    <p className="text-[11px] font-bold text-muted/60 uppercase tracking-widest mt-1">Día {g.diaVencimiento} · {g.categoria}</p>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-base font-black text-danger tracking-tighter">
                      {formatMoney(g.monto, g.moneda as "ARS" | "USD")}
                    </p>
                    {g.moneda === "USD" && (g.montoARS || g.tipoCambio) && (
                       <p className="text-[10px] font-bold text-muted/40 mt-0.5 italic">
                         ≈ {formatMoney(g.montoARS || g.monto * (g.tipoCambio || 1420))}
                       </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditId(g._id); setEditData({ nombre: g.nombre, monto: g.monto, diaVencimiento: g.diaVencimiento }); }}
                      className="p-2 rounded-lg bg-surface-light/50 text-muted hover:text-primary transition-colors border border-white/5"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(g._id)}
                      className="p-2 rounded-lg bg-surface-light/50 text-muted hover:text-danger transition-colors border border-white/5"><Trash2 className="w-4 h-4" /></button>
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
