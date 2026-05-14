"use client";

import { useEffect, useState, useMemo } from "react";
import { formatMoney, getCategoryIcon, getMonthName } from "@/lib/utils";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, LineChart, Line, CartesianGrid, YAxis, XAxis,
} from "recharts";
import { ChevronLeft, ChevronRight, Landmark, TrendingUp } from "lucide-react";

interface Mov { _id: string; tipo: string; monto: number; moneda: string; montoARS?: number; categoria: string; fecha: string; }
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-3 text-xs font-bold">
      <p className="text-muted mb-1">{label}</p>
      {payload.map((p: any) => <p key={p.dataKey} style={{ color: p.color }}>{formatMoney(p.value)}</p>)}
    </div>
  );
};

export default function EstadisticasPage() {
  const [movimientos, setMovimientos] = useState<Mov[]>([]);
  const [evolucion, setEvolucion] = useState<{ label: string; balance: number; ingresos: number; gastos: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesOffset, setMesOffset] = useState(0);

  const { mes, anio } = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - mesOffset);
    return { mes: d.getMonth(), anio: d.getFullYear() };
  }, [mesOffset]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const res = await fetch(`/api/movimientos?mes=${mes}&anio=${anio}`);
        const data = await res.json();
        setMovimientos(Array.isArray(data) ? data : []);
        const now = new Date();
        const promises = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return fetch(`/api/movimientos?mes=${d.getMonth()}&anio=${d.getFullYear()}`).then(r => r.json()).then(movs => {
            const monthLabel = getMonthName(d.getMonth()).slice(0, 3);
            const ing = Array.isArray(movs) ? movs.filter((m: Mov) => m.tipo === "ingreso").reduce((s: number, m: Mov) => s + (m.montoARS || m.monto), 0) : 0;
            const gas = Array.isArray(movs) ? movs.filter((m: Mov) => m.tipo === "gasto").reduce((s: number, m: Mov) => s + (m.montoARS || m.monto), 0) : 0;
            return { label: monthLabel, balance: ing - gas, ingresos: ing, gastos: gas };
          });
        });
        setEvolucion(await Promise.all(promises));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchAll();
  }, [mes, anio]);

  const gastos = movimientos.filter(m => m.tipo === "gasto");
  const totalGastos = gastos.reduce((s, m) => s + (m.montoARS || m.monto), 0);
  const totalIngresos = movimientos.filter(m => m.tipo === "ingreso").reduce((s, m) => s + (m.montoARS || m.monto), 0);
  const categoriaData = useMemo(() => {
    const map = new Map<string, number>();
    gastos.forEach(m => map.set(m.categoria, (map.get(m.categoria) || 0) + (m.montoARS || m.monto)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [gastos]);

  if (loading) return <div className="flex items-center justify-center min-h-dvh"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container-mobile fade-up">
      <div className="flex items-center justify-between mb-8 mt-4">
        <h1 className="text-3xl font-extrabold tracking-tighter">Reporte</h1>
        <div className="flex items-center gap-1 bg-[#111] p-1 rounded-full border border-white/5">
          <button onClick={() => setMesOffset(p => p + 1)} className="p-2 rounded-full active:scale-90"><ChevronLeft className="w-4 h-4 text-muted" /></button>
          <span className="text-[9px] font-black uppercase tracking-widest px-1 min-w-[80px] text-center">{getMonthName(mes).slice(0,3)} {anio}</span>
          <button onClick={() => setMesOffset(p => Math.max(0, p - 1))} disabled={mesOffset === 0} className="p-2 rounded-full active:scale-90 disabled:opacity-10"><ChevronRight className="w-4 h-4 text-muted" /></button>
        </div>
      </div>

      <div className="premium-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4 opacity-40"><Landmark className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-[0.3em]">Resumen</span></div>
        <div className="grid grid-cols-3 gap-3">
          <div><p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Ingresos</p><p className="text-sm font-black text-success">{formatMoney(totalIngresos)}</p></div>
          <div><p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Gastos</p><p className="text-sm font-black text-danger">{formatMoney(totalGastos)}</p></div>
          <div><p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Balance</p><p className={`text-sm font-black ${totalIngresos - totalGastos >= 0 ? "text-white" : "text-danger"}`}>{formatMoney(totalIngresos - totalGastos)}</p></div>
        </div>
      </div>

      {movimientos.length === 0 ? (
        <div className="p-20 text-center border border-dashed border-white/5 rounded-3xl"><p className="text-[10px] font-bold text-muted uppercase tracking-widest">Sin actividad</p></div>
      ) : (
        <div className="space-y-8">
          <div className="premium-card p-6">
            <div className="flex items-center gap-2 mb-5 opacity-40"><TrendingUp className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-[0.3em]">Evolución 6 Meses</span></div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={evolucion}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 9, fontWeight: "bold" }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 3 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-5 mt-3">
              {[["#10b981","Ingresos"],["#ef4444","Gastos"],["#6366f1","Balance"]].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: c }} /><span className="text-[9px] font-bold text-muted">{l}</span></div>
              ))}
            </div>
          </div>

          {categoriaData.length > 0 && (
            <div className="premium-card p-6">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted mb-5 text-center">Por Categoría</p>
              <div className="flex justify-center mb-5">
                <div className="w-[150px] h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={categoriaData} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={68} stroke="none" paddingAngle={4}>
                      {categoriaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie></PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-3.5">
                {categoriaData.map((cat, i) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} /><span className="text-[11px] font-bold">{getCategoryIcon(cat.name)} {cat.name}</span></div>
                      <div className="text-right"><span className="text-[11px] font-black">{formatMoney(cat.value)}</span><span className="text-[9px] text-muted ml-1">{totalGastos > 0 ? Math.round((cat.value/totalGastos)*100) : 0}%</span></div>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${totalGastos > 0 ? (cat.value/totalGastos)*100 : 0}%`, background: COLORS[i % COLORS.length] }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
