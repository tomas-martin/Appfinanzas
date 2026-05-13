"use client";

import { useEffect, useState } from "react";
import { Trash2, X, ToggleLeft, ToggleRight, ChevronLeft, Plus, CheckCircle2, Circle } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { type Moneda } from "@/types";
import Link from "next/link";

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
  ultimoPago?: string;
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

  async function handlePagar(id: string) {
    await fetch(`/api/gastos-fijos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ultimoPago: new Date().toISOString() }),
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
    <div className="container-mobile fade-up">
      <div className="flex items-center justify-between mt-4 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3.5 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tighter">Fijos</h1>
        </div>
        <Link href="/nuevo" className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-90 transition-all">
          <Plus className="w-6 h-6 stroke-[3px]" />
        </Link>
      </div>

      <div className="text-center mb-12">
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-3">Total Mensual</p>
        <h2 className="text-4xl font-extrabold tracking-tighter">{formatMoney(totalActivoARS)}</h2>
      </div>

      <div className="space-y-3">
        {gastos.map((g) => {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const lastPaidDate = g.ultimoPago ? new Date(g.ultimoPago) : null;
          const isPaidThisMonth = lastPaidDate && 
                                  lastPaidDate.getMonth() === currentMonth && 
                                  lastPaidDate.getFullYear() === currentYear;

          return (
            <div key={g._id} className={`premium-card transition-all ${!g.activo ? "opacity-30" : ""} ${editId === g._id ? "p-6 bg-[#151515]" : "p-4"}`}>
              {editId === g._id ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Editar servicio</span>
                    <button onClick={() => setEditId(null)} className="p-1"><X className="w-4 h-4 text-muted" /></button>
                  </div>
                  <input type="text" value={editData.nombre ?? g.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                    className="input-premium py-2 text-sm" />
                  <div className="flex gap-2">
                    <input type="number" value={editData.monto ?? g.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                      className="input-premium py-2 text-sm" />
                    <input type="number" value={editData.diaVencimiento ?? g.diaVencimiento} onChange={(e) => setEditData({ ...editData, diaVencimiento: Number(e.target.value) })}
                      className="input-premium py-2 text-sm text-center w-20" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(g._id)} className="flex-1 btn-premium py-2 text-[9px]">Guardar</button>
                    <button onClick={() => handleDelete(g._id)} className="p-2 bg-danger/10 text-danger rounded-xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => handleToggle(g._id, g.activo)} className="shrink-0 active:scale-90 transition-all">
                    {g.activo ? 
                      <ToggleRight className="w-10 h-10 text-white" /> : 
                      <ToggleLeft className="w-10 h-10 text-muted/20" />
                    }
                  </button>
                  <div className="flex-1 min-w-0" onClick={() => setEditId(g._id)}>
                    <div className="flex items-center gap-2">
                      <p className="font-bold truncate text-sm text-white/90">{g.nombre}</p>
                      {isPaidThisMonth ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-warning" />
                      )}
                    </div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-0.5">Día {g.diaVencimiento} · {g.categoria}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right" onClick={() => setEditId(g._id)}>
                      <p className="font-bold text-sm tracking-tight text-white">{formatMoney(g.monto, g.moneda)}</p>
                    </div>
                    {g.activo && (
                      <button onClick={(e) => { e.stopPropagation(); handlePagar(g._id); }}
                        disabled={isPaidThisMonth}
                        className={`p-2.5 rounded-xl transition-all active:scale-90 ${isPaidThisMonth ? "bg-success/10 text-success" : "bg-white text-black"}`}>
                        <Plus className={`w-4 h-4 ${isPaidThisMonth ? "" : "stroke-[3px]"}`} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
