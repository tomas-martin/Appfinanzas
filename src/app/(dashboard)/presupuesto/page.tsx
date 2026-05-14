"use client";

import { useEffect, useState, useMemo } from "react";
import { formatMoney, getCategoryIcon } from "@/lib/utils";
import { CATEGORIAS_GASTO } from "@/types";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface Presupuesto {
  _id: string;
  categoria: string;
  monto: number;
}
interface Mov {
  categoria: string;
  monto: number;
  montoARS?: number;
  tipo: string;
}

export default function PresupuestoPage() {
  const router = useRouter();
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [movimientos, setMovimientos] = useState<Mov[]>([]);
  const [mesOffset, setMesOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newCat, setNewCat] = useState<typeof CATEGORIAS_GASTO[number]>(CATEGORIAS_GASTO[0]);
  const [newMonto, setNewMonto] = useState("");
  const [saving, setSaving] = useState(false);

  const { mes, anio, label } = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - mesOffset);
    const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    return { mes: d.getMonth(), anio: d.getFullYear(), label: `${months[d.getMonth()]} ${d.getFullYear()}` };
  }, [mesOffset]);

  useEffect(() => { fetchAll(); }, [mes, anio]);

  async function fetchAll() {
    const [pRes, mRes] = await Promise.all([
      fetch(`/api/presupuestos?mes=${mes}&anio=${anio}`),
      fetch(`/api/movimientos?mes=${mes}&anio=${anio}`),
    ]);
    setPresupuestos(await pRes.json());
    const movs = await mRes.json();
    setMovimientos(Array.isArray(movs) ? movs.filter((m: Mov) => m.tipo === "gasto") : []);
  }

  async function handleSave() {
    if (!newMonto || Number(newMonto) <= 0) return;
    setSaving(true);
    await fetch("/api/presupuestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria: newCat, monto: Number(newMonto), mes, anio }),
    });
    setShowForm(false);
    setNewMonto("");
    setSaving(false);
    fetchAll();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/presupuestos/${id}`, { method: "DELETE" });
    setPresupuestos(prev => prev.filter(p => p._id !== id));
  }

  // Gasto real por categoría
  const gastoReal = useMemo(() => {
    const map = new Map<string, number>();
    movimientos.forEach(m => {
      map.set(m.categoria, (map.get(m.categoria) || 0) + (m.montoARS || m.monto));
    });
    return map;
  }, [movimientos]);

  const totalPresupuesto = presupuestos.reduce((s, p) => s + p.monto, 0);
  const totalGastado = presupuestos.reduce((s, p) => s + (gastoReal.get(p.categoria) || 0), 0);
  const pctGlobal = totalPresupuesto > 0 ? Math.min((totalGastado / totalPresupuesto) * 100, 100) : 0;

  return (
    <div className="container-mobile fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mt-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3.5 rounded-full bg-[#111111] border border-white/5 active:scale-90 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tighter">Presupuesto</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl active:scale-90 transition-all">
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6 stroke-[3px]" />}
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-6 mb-8 bg-[#0D0D0D] py-3.5 rounded-[2rem] border border-white/5">
        <button onClick={() => setMesOffset(p => p + 1)} className="p-2.5 rounded-full hover:bg-white/5 active:scale-75 transition-all text-muted">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-black uppercase tracking-[0.4em]">{label}</span>
        <button onClick={() => setMesOffset(p => Math.max(0, p - 1))} disabled={mesOffset === 0}
          className="p-2.5 rounded-full hover:bg-white/5 active:scale-75 transition-all text-muted disabled:opacity-20">
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      </div>

      {/* Global summary */}
      {presupuestos.length > 0 && (
        <div className="premium-card p-6 mb-8">
          <div className="flex justify-between mb-3">
            <div>
              <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Gastado</p>
              <p className="text-xl font-black">{formatMoney(totalGastado)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Presupuesto</p>
              <p className="text-xl font-black">{formatMoney(totalPresupuesto)}</p>
            </div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pctGlobal >= 100 ? "bg-danger" : pctGlobal >= 80 ? "bg-warning" : "bg-success"}`}
              style={{ width: `${pctGlobal}%` }}
            />
          </div>
          <p className={`text-[10px] font-bold mt-2 text-right ${pctGlobal >= 100 ? "text-danger" : "text-muted"}`}>
            {pctGlobal >= 100 ? "⚠ Presupuesto superado" : `${Math.round(pctGlobal)}% utilizado`}
          </p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="premium-card p-6 mb-6 ring-1 ring-primary/20">
          <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-5">Nuevo presupuesto</p>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Categoría</label>
              <select value={newCat} onChange={e => setNewCat(e.target.value as typeof CATEGORIAS_GASTO[number])} className="input-premium py-3">
                {CATEGORIAS_GASTO.map(c => (
                  <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Límite mensual (ARS)</label>
              <input type="number" value={newMonto} onChange={e => setNewMonto(e.target.value)}
                placeholder="0" className="input-premium py-3 text-lg font-black" autoFocus />
            </div>
            <button onClick={handleSave} disabled={saving || !newMonto}
              className="btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40">
              {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Guardar</>}
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      {presupuestos.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-white/5 rounded-3xl">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Sin presupuestos</p>
          <p className="text-[11px] text-muted/50">Tocá + para agregar un límite por categoría</p>
        </div>
      ) : (
        <div className="space-y-3">
          {presupuestos.map(p => {
            const gastado = gastoReal.get(p.categoria) || 0;
            const pct = Math.min((gastado / p.monto) * 100, 100);
            const resto = p.monto - gastado;
            return (
              <div key={p._id} className="premium-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(p.categoria)}</span>
                    <div>
                      <p className="text-[13px] font-bold">{p.categoria}</p>
                      <p className={`text-[10px] font-bold mt-0.5 ${resto < 0 ? "text-danger" : "text-muted"}`}>
                        {resto < 0 ? `Excedido por ${formatMoney(Math.abs(resto))}` : `Resta ${formatMoney(resto)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-[13px] font-black">{formatMoney(gastado)}</p>
                      <p className="text-[9px] text-muted uppercase tracking-widest">/ {formatMoney(p.monto)}</p>
                    </div>
                    <button onClick={() => handleDelete(p._id)} className="p-2 text-muted/20 hover:text-danger active:scale-90 transition-all ml-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-success"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[9px] text-muted mt-1.5 text-right">{Math.round(pct)}%</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
