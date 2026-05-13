"use client";

import { useEffect, useState, useMemo } from "react";
import { formatMoney, getCategoryIcon, getMonthName } from "@/lib/utils";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Mov {
  _id: string;
  tipo: string;
  monto: number;
  moneda: string;
  categoria: string;
  fecha: string;
}

const COLORS = [
  "#FFFFFF", "#888888", "#444444", "#222222", "#666666",
  "#333333", "#999999", "#AAAAAA", "#CCCCCC", "#EEEEEE"
];

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

  const gastos = movimientos.filter((m) => m.tipo === "gasto");
  const ingresos = movimientos.filter((m) => m.tipo === "ingreso");
  const totalGastos = gastos.reduce((s, m) => s + m.monto, 0);
  const totalIngresos = ingresos.reduce((s, m) => s + m.monto, 0);

  const categoriaData = useMemo(() => {
    const map = new Map<string, number>();
    gastos.forEach((m) => {
      map.set(m.categoria, (map.get(m.categoria) || 0) + m.monto);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [gastos]);

  const barData = [
    { name: "Ingresos", monto: totalIngresos, fill: "#FFFFFF" },
    { name: "Gastos", monto: totalGastos, fill: "#333333" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile fade-in-up">
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-4xl font-extrabold tracking-tighter">Stats</h1>
        <div className="flex items-center gap-2 bg-[#111111] p-1.5 rounded-full border border-white/5">
          <button onClick={() => setMesOffset((p) => p + 1)} className="p-2.5 rounded-full hover:bg-white/5 active:scale-90 transition-all">
            <ChevronLeft className="w-5 h-5 text-muted" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest px-4 min-w-[100px] text-center">
            {getMonthName(mes)} {anio}
          </span>
          <button onClick={() => setMesOffset((p) => Math.max(0, p - 1))} disabled={mesOffset === 0}
            className="p-2.5 rounded-full hover:bg-white/5 active:scale-90 transition-all disabled:opacity-10">
            <ChevronRight className="w-5 h-5 text-muted" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-20">
        <div className="premium-card p-10 flex flex-col items-center">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Ingresos</p>
          <p className="text-2xl font-bold text-white">{formatMoney(totalIngresos)}</p>
        </div>
        <div className="premium-card p-10 flex flex-col items-center">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Gastos</p>
          <p className="text-2xl font-bold text-white">{formatMoney(totalGastos)}</p>
        </div>
      </div>

      {movimientos.length === 0 ? (
        <div className="p-24 text-center">
          <p className="text-xs font-bold text-muted uppercase tracking-widest">Sin datos este mes</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="premium-card p-10">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted mb-10">Balance Mensual</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#666666", fontSize: 10, fontWeight: "bold" }} dy={10} />
                <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", fontSize: "10px", fontWeight: "bold" }} />
                <Bar dataKey="monto" radius={[12, 12, 12, 12]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="premium-card p-10">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted mb-10">Distribución</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoriaData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} stroke="none" paddingAngle={4}>
                  {categoriaData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", fontSize: "10px", fontWeight: "bold" }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-6 mt-12">
              {categoriaData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className="w-4 h-4 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-bold text-white/90">{getCategoryIcon(cat.name)} {cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatMoney(cat.value)}</p>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-1">
                      {totalGastos > 0 ? Math.round((cat.value / totalGastos) * 100) : 0}%
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
