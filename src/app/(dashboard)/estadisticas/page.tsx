"use client";

import { useEffect, useState, useMemo } from "react";
import { formatMoney, getCategoryIcon, getMonthName } from "@/lib/utils";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, Tooltip,
} from "recharts";
import { ChevronLeft, ChevronRight, Landmark } from "lucide-react";

interface Mov {
  _id: string;
  tipo: string;
  monto: number;
  moneda: string;
  montoARS?: number;
  categoria: string;
  fecha: string;
}

const COLORS = ["#FFFFFF", "#888888", "#444444", "#222222", "#666666"];

export default function EstadisticasPage() {
  const [movimientos, setMovimientos] = useState<Mov[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesOffset, setMesOffset] = useState(0);

  const { mes, anio } = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - mesOffset);
    return { mes: d.getMonth(), anio: d.getFullYear() };
  }, [mesOffset]);

  useEffect(() => {
    async function fetch_data() {
      try {
        const res = await fetch(`/api/movimientos?mes=${mes}&anio=${anio}`);
        const data = await res.json();
        setMovimientos(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    setLoading(true);
    fetch_data();
  }, [mes, anio]);

  // All stats calculated in ARS for consistency in charts, but labels will show currency
  const totalGastosARS = movimientos.filter(m => m.tipo === "gasto").reduce((s, m) => s + (m.montoARS || m.monto), 0);
  const totalIngresosARS = movimientos.filter(m => m.tipo === "ingreso").reduce((s, m) => s + (m.montoARS || m.monto), 0);

  const categoriaData = useMemo(() => {
    const map = new Map<string, number>();
    movimientos.filter(m => m.tipo === "gasto").forEach((m) => {
      map.set(m.categoria, (map.get(m.categoria) || 0) + (m.montoARS || m.monto));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [movimientos]);

  const barData = [
    { name: "Ingresos", monto: totalIngresosARS, fill: "#FFFFFF" },
    { name: "Gastos", monto: totalGastosARS, fill: "#333333" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile fade-up">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-extrabold tracking-tighter">Reporte</h1>
        <div className="flex items-center gap-2 bg-[#111111] p-1 rounded-full border border-white/5">
          <button onClick={() => setMesOffset((p) => p + 1)} className="p-2 rounded-full hover:bg-white/5 active:scale-90">
            <ChevronLeft className="w-4 h-4 text-muted" />
          </button>
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 min-w-[90px] text-center">
            {getMonthName(mes)} {anio}
          </span>
          <button onClick={() => setMesOffset((p) => Math.max(0, p - 1))} disabled={mesOffset === 0}
            className="p-2 rounded-full hover:bg-white/5 active:scale-90 disabled:opacity-10">
            <ChevronRight className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      <div className="premium-card p-8 mb-10 bg-gradient-to-br from-[#0D0D0D] to-black">
        <div className="flex items-center gap-3 mb-6 opacity-30">
          <Landmark className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Resumen Mensual (ARS)</span>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Ingresos</p>
            <p className="text-xl font-bold text-white">{formatMoney(totalIngresosARS)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Gastos</p>
            <p className="text-xl font-bold text-white">{formatMoney(totalGastosARS)}</p>
          </div>
        </div>
      </div>

      {movimientos.length === 0 ? (
        <div className="p-20 text-center border border-dashed border-white/5 rounded-[2rem]">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Sin actividad este mes</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="premium-card p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted mb-8 text-center">Flujo de Caja (Pesos)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#666666", fontSize: 9, fontWeight: "bold" }} dy={10} />
                <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "15px", fontSize: "10px", fontWeight: "bold" }} />
                <Bar dataKey="monto" radius={[10, 10, 10, 10]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="premium-card p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted mb-8 text-center">Gastos por Categoría</p>
            <div className="flex justify-center mb-8">
              <div className="w-[180px] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoriaData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} stroke="none" paddingAngle={5}>
                      {categoriaData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-5 px-2">
              {categoriaData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[11px] font-bold text-white/80">{getCategoryIcon(cat.name)} {cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold">{formatMoney(cat.value)}</p>
                    <p className="text-[8px] font-bold text-muted uppercase tracking-widest mt-0.5">
                      {totalGastosARS > 0 ? Math.round((cat.value / totalGastosARS) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
