"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, X, ToggleLeft, ToggleRight, ChevronLeft } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { type Moneda } from "@/types";

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
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-safe-forced pb-safe-forced fade-up">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={() => router.back()} className="p-4 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-extrabold tracking-tighter">Fijos</h1>
      </div>

      <div className="text-center mb-20">
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.4em] mb-4">Total Mensual</p>
        <h2 className="text-5xl font-extrabold tracking-tighter">{formatMoney(totalActivoARS)}</h2>
      </div>

      <div className="space-y-4">
        {gastos.map((g) => (
          <div key={g._id} className={`premium-card p-6 transition-all group ${!g.activo ? "opacity-30 grayscale" : ""}`}>
            {editId === g._id ? (
              <div className="space-y-6">
                <input type="text" value={editData.nombre ?? g.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                  className="w-full bg-black rounded-xl px-5 py-4 text-sm text-foreground border border-white/10 outline-none" />
                <div className="flex gap-4">
                  <input type="number" value={editData.monto ?? g.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                    className="w-full bg-black rounded-xl px-5 py-4 text-sm text-foreground border border-white/10 outline-none" />
                  <input type="number" value={editData.diaVencimiento ?? g.diaVencimiento} onChange={(e) => setEditData({ ...editData, diaVencimiento: Number(e.target.value) })}
                    className="w-24 bg-black rounded-xl px-5 py-4 text-sm text-foreground border border-white/10 outline-none text-center" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(g._id)} className="flex-1 btn-apple py-4 text-[10px]">Guardar</button>
                  <button onClick={() => setEditId(null)} className="p-4 bg-[#111111] rounded-2xl"><X className="w-5 h-5 text-muted" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <button onClick={() => handleToggle(g._id, g.activo)} className="shrink-0 transition-all active:scale-90">
                  {g.activo ? 
                    <ToggleRight className="w-12 h-12 text-white" /> : 
                    <ToggleLeft className="w-12 h-12 text-muted/20" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-white/90">{g.nombre}</p>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider mt-1">Día {g.diaVencimiento} · {g.categoria}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold tracking-tight text-white">{formatMoney(g.monto, g.moneda)}</p>
                  <div className="flex items-center justify-end gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditId(g._id); setEditData({ nombre: g.nombre, monto: g.monto, diaVencimiento: g.diaVencimiento }); }}
                      className="text-muted hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(g._id)}
                      className="text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
