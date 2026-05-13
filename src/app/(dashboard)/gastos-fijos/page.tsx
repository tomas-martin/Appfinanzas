"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, X, ToggleLeft, ToggleRight } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";

interface GF {
  _id: string;
  nombre: string;
  monto: number;
  moneda: string;
  diaVencimiento: number;
  categoria: string;
  activo: boolean;
}

export default function GastosFijosPage() {
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

  const totalActivo = gastos.filter((g) => g.activo).reduce((s, g) => s + g.monto, 0);

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
        <h1 className="text-xl font-bold">Gastos Fijos</h1>
        <Link href="/nuevo" className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium">+ Nuevo</Link>
      </div>

      {/* Total card */}
      <div className="glass-card p-4 mb-5">
        <p className="text-xs text-muted mb-1">Total mensual activo</p>
        <p className="text-2xl font-bold text-danger">{formatMoney(totalActivo)}</p>
        <p className="text-xs text-muted mt-1">{gastos.filter((g) => g.activo).length} gastos activos</p>
      </div>

      {gastos.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-muted text-sm">No hay gastos fijos</p>
          <Link href="/nuevo" className="text-primary text-sm mt-2 inline-block">Agregar uno →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {gastos.map((g) => (
            <div key={g._id} className={`glass-card p-3.5 ${!g.activo ? "opacity-50" : ""}`}>
              {editId === g._id ? (
                <div className="space-y-3">
                  <input type="text" value={editData.nombre ?? g.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                    className="w-full bg-surface-light rounded-lg px-3 py-2 text-sm text-foreground border border-border" />
                  <div className="flex gap-2">
                    <input type="number" value={editData.monto ?? g.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                      className="flex-1 bg-surface-light rounded-lg px-3 py-2 text-sm text-foreground border border-border" />
                    <input type="number" value={editData.diaVencimiento ?? g.diaVencimiento} onChange={(e) => setEditData({ ...editData, diaVencimiento: Number(e.target.value) })}
                      min="1" max="31" className="w-20 bg-surface-light rounded-lg px-3 py-2 text-sm text-foreground border border-border" placeholder="Día" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(g._id)} className="flex-1 bg-primary text-white text-xs py-2 rounded-lg font-medium">Guardar</button>
                    <button onClick={() => setEditId(null)} className="px-3 bg-surface-light text-muted text-xs py-2 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggle(g._id, g.activo)} className="text-primary shrink-0">
                    {g.activo ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-muted" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{g.nombre}</p>
                    <p className="text-[10px] text-muted">Vence el día {g.diaVencimiento} · {g.categoria}</p>
                  </div>
                  <p className="text-sm font-semibold text-danger mr-2">
                    {formatMoney(g.monto, g.moneda as "ARS" | "USD")}
                  </p>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditId(g._id); setEditData({ nombre: g.nombre, monto: g.monto, diaVencimiento: g.diaVencimiento }); }}
                      className="p-1.5 rounded-lg bg-surface-light text-muted hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(g._id)}
                      className="p-1.5 rounded-lg bg-surface-light text-muted hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
