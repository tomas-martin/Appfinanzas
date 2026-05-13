"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, X, ToggleLeft, ToggleRight, ChevronLeft, Calendar } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { type Moneda } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GF {
  _id: string;
  nombre: string;
  monto: number;
  moneda: Moneda;
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
      <div className="flex items-center justify-center min-h-dvh bg-[#060912]">
        <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-safe pb-nav fade-in">
      <div className="flex items-center justify-between mt-12 mb-16 px-1">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-3.5 rounded-[1.2rem] bg-white/[0.02] border border-white/5 text-muted/30 hover:text-primary transition-all shadow-xl">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-muted/20 text-[8px] font-black uppercase tracking-[0.5em] mb-1">Recurrente</p>
            <h1 className="text-2xl font-black tracking-tighter text-white/90">Fijos</h1>
          </div>
        </div>
        <Link href="/nuevo" className="bg-white text-black px-6 py-3.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-[0.95]">+ Nuevo</Link>
      </div>

      {/* Total card - Minimalist Refinement */}
      <div className="glass-card p-10 mb-16 relative overflow-hidden group border-white/[0.02] bg-white/[0.01]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-danger/[0.03] rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
        <p className="text-[9px] font-black text-muted/20 uppercase tracking-[0.4em] mb-4">Total mensual estimado</p>
        <h2 className="text-4xl font-black text-white/90 tracking-tighter">{formatMoney(totalActivoARS)} <span className="text-[10px] font-black text-muted/10 uppercase tracking-widest ml-1">ARS</span></h2>
        <div className="flex items-center gap-3 mt-6">
          <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          <p className="text-[9px] font-black text-muted/20 uppercase tracking-[0.2em]">{gastos.filter((g) => g.activo).length} servicios activos</p>
        </div>
      </div>

      {gastos.length === 0 ? (
        <div className="p-24 text-center border border-dashed border-white/[0.03] rounded-[2.5rem]">
          <p className="text-muted/10 text-[9px] font-black uppercase tracking-[0.6em]">Sin gastos fijos</p>
        </div>
      ) : (
        <div className="space-y-6">
          {gastos.map((g) => (
            <div key={g._id} className={`glass-card p-5 transition-all border-white/[0.02] bg-white/[0.01] group relative ${!g.activo ? "opacity-20 grayscale" : "hover:bg-white/[0.02]"}`}>
              {editId === g._id ? (
                <div className="space-y-6 p-2 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted/20 uppercase tracking-[0.4em] ml-2">Nombre</label>
                    <input type="text" value={editData.nombre ?? g.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                      className="w-full bg-white/[0.02] rounded-xl px-5 py-4 text-sm text-foreground border border-white/5 outline-none" />
                  </div>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8 space-y-3">
                      <label className="text-[9px] font-black text-muted/20 uppercase tracking-[0.4em] ml-2">Monto</label>
                      <input type="number" value={editData.monto ?? g.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                        className="w-full bg-white/[0.02] rounded-xl px-5 py-4 text-sm text-foreground border border-white/5 outline-none" />
                    </div>
                    <div className="col-span-4 space-y-3">
                      <label className="text-[9px] font-black text-muted/20 uppercase tracking-[0.4em] ml-2">Día</label>
                      <input type="number" value={editData.diaVencimiento ?? g.diaVencimiento} onChange={(e) => setEditData({ ...editData, diaVencimiento: Number(e.target.value) })}
                        min="1" max="31" className="w-full bg-white/[0.02] rounded-xl px-5 py-4 text-sm text-foreground border border-white/5 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => handleEdit(g._id)} className="flex-1 bg-white text-black text-[9px] py-4.5 rounded-xl font-black uppercase tracking-[0.3em]">Guardar</button>
                    <button onClick={() => setEditId(null)} className="px-5 bg-white/5 text-muted/30 text-xs py-4.5 rounded-xl"><X className="w-5 h-5" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <button onClick={() => handleToggle(g._id, g.activo)} className="shrink-0 transition-all active:scale-90">
                    {g.activo ? 
                      <div className="p-1 rounded-full bg-primary/5 border border-primary/10"><ToggleRight className="w-10 h-10 text-primary/70" /></div> : 
                      <div className="p-1 rounded-full bg-white/5 border border-white/5"><ToggleLeft className="w-10 h-10 text-muted/10" /></div>
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black tracking-tight truncate text-white/90">{g.nombre}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[9px] font-black text-muted/20 uppercase tracking-[0.3em]">Día {g.diaVencimiento}</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/[0.05]" />
                      <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.3em]">{g.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-black text-white/90 tracking-tighter">
                      {formatMoney(g.monto, g.moneda)}
                    </p>
                    {g.moneda === "USD" && (g.montoARS || g.tipoCambio) && (
                       <p className="text-[8px] font-black text-muted/10 mt-1 uppercase tracking-widest">
                         ≈ {formatMoney(g.montoARS || g.monto * (g.tipoCambio || 1420))}
                       </p>
                    )}
                    <div className="flex items-center justify-end gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditId(g._id); setEditData({ nombre: g.nombre, monto: g.monto, diaVencimiento: g.diaVencimiento }); }}
                        className="p-2 rounded-lg text-muted/20 hover:text-primary transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(g._id)}
                        className="p-2 rounded-lg text-muted/20 hover:text-danger transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
