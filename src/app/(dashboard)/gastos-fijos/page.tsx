"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, X, ToggleLeft, ToggleRight, ChevronLeft, Calendar, ShieldCheck, AlertCircle } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-dvh bg-[#060912]">
        <div className="w-12 h-12 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-14 pb-44 fade-in">
      <div className="flex items-center justify-between mb-12 px-1">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 text-muted/40 hover:text-primary transition-all shadow-xl">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-muted/30 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Recurrente</p>
            <h1 className="text-3xl font-black tracking-tighter">Fijos</h1>
          </div>
        </div>
        <Link href="/nuevo" className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-[0.95]">+ Nuevo</Link>
      </div>

      {/* Total card - Ultra Refined */}
      <div className="glass-card p-10 mb-14 relative overflow-hidden group border-white/5 bg-white/[0.01] shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.4em]">Compromiso mensual</p>
          </div>
          
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4">
            {formatMoney(totalActivoARS)}
            <span className="text-sm ml-2 font-black text-muted/20 uppercase tracking-[0.2em]">ARS</span>
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
            <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em]">
              {gastos.filter((g) => g.activo).length} suscripciones activas este mes
            </p>
          </div>
        </div>
      </div>

      {gastos.length === 0 ? (
        <div className="glass-card p-24 text-center border-dashed border-white/[0.05] bg-transparent">
          <div className="w-24 h-24 bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/[0.03]">
            <Calendar className="w-10 h-10 text-muted/5" />
          </div>
          <p className="text-muted/20 text-[10px] font-black uppercase tracking-[0.5em]">Sin gastos fijos</p>
          <Link href="/nuevo" className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-8 inline-block hover:opacity-70 transition-opacity">Registrar servicio →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {gastos.map((g) => (
            <div key={g._id} className={`glass-card p-6 transition-all border-white/5 group relative overflow-hidden ${!g.activo ? "opacity-30 grayscale saturate-0" : "hover:bg-white/[0.01]"}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {editId === g._id ? (
                <div className="space-y-6 p-2 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted/30 uppercase tracking-[0.3em] ml-2">Nombre del gasto</label>
                    <input type="text" value={editData.nombre ?? g.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                      className="w-full bg-white/[0.03] rounded-2xl px-5 py-4 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none shadow-inner" />
                  </div>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8 space-y-3">
                      <label className="text-[10px] font-black text-muted/30 uppercase tracking-[0.3em] ml-2">Monto</label>
                      <input type="number" value={editData.monto ?? g.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                        className="w-full bg-white/[0.03] rounded-2xl px-5 py-4 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none shadow-inner" />
                    </div>
                    <div className="col-span-4 space-y-3">
                      <label className="text-[10px] font-black text-muted/30 uppercase tracking-[0.3em] ml-2">Día</label>
                      <input type="number" value={editData.diaVencimiento ?? g.diaVencimiento} onChange={(e) => setEditData({ ...editData, diaVencimiento: Number(e.target.value) })}
                        min="1" max="31" className="w-full bg-white/[0.03] rounded-2xl px-5 py-4 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none shadow-inner" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => handleEdit(g._id)} className="flex-1 bg-primary text-white text-[10px] py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20">Guardar</button>
                    <button onClick={() => setEditId(null)} className="px-6 bg-white/[0.03] text-muted/40 text-xs py-5 rounded-2xl border border-white/5"><X className="w-6 h-6" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6 relative z-10">
                  <button onClick={() => handleToggle(g._id, g.activo)} className="shrink-0 transition-all active:scale-90 group/toggle">
                    {g.activo ? 
                      <div className="p-1 rounded-full bg-primary/10 border border-primary/20"><ToggleRight className="w-12 h-12 text-primary" /></div> : 
                      <div className="p-1 rounded-full bg-white/[0.02] border border-white/5"><ToggleLeft className="w-12 h-12 text-muted/20" /></div>
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black tracking-tight truncate text-white/90">{g.nombre}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[10px] font-black text-muted/30 uppercase tracking-[0.2em]">Día {g.diaVencimiento}</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/[0.05]" />
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">{g.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white tracking-tighter">
                      {formatMoney(g.monto, g.moneda as "ARS" | "USD")}
                    </p>
                    {g.moneda === "USD" && (g.montoARS || g.tipoCambio) && (
                       <p className="text-[10px] font-black text-muted/20 mt-1 uppercase tracking-widest">
                         ≈ {formatMoney(g.montoARS || g.monto * (g.tipoCambio || 1420))}
                       </p>
                    )}
                    <div className="flex items-center justify-end gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditId(g._id); setEditData({ nombre: g.nombre, monto: g.monto, diaVencimiento: g.diaVencimiento }); }}
                        className="p-2.5 rounded-xl bg-white/5 text-muted/30 hover:text-primary hover:bg-primary/10 transition-all border border-white/5"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(g._id)}
                        className="p-2.5 rounded-xl bg-white/5 text-muted/30 hover:text-danger hover:bg-danger/10 transition-all border border-white/5"><Trash2 className="w-4 h-4" /></button>
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
