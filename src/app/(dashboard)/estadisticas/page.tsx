"use client";

import { useEffect, useState, useMemo } from "react";
import { formatMoney, getCategoryIcon, getMonthName } from "@/lib/utils";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

interface Mov {
  _id: string;
  tipo: string;
  monto: number;
  moneda: string;
  categoria: string;
  fecha: string;
}

const COLORS = [
  "#6C63FF", "#00C896", "#FF4D6D", "#FFB443", "#38BDF8",
  "#A78BFA", "#F472B6", "#34D399", "#FB923C", "#818CF8",
  "#E879F9",
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

  // Group by category for pie chart
  const categoriaData = useMemo(() => {
    const map = new Map<string, number>();
    gastos.forEach((m) => {
      map.set(m.categoria, (map.get(m.categoria) || 0) + m.monto);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [gastos]);

  // Bar chart data: income vs expense
  const barData = [
    { name: "Ingresos", monto: totalIngresos, fill: "#00C896" },
    { name: "Gastos", monto: totalGastos, fill: "#FF4D6D" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 fade-in">
      <h1 className="text-xl font-bold mb-5">Estadísticas</h1>

      {/* Month selector */}
      <div className="flex items-center justify-between glass-card p-3 mb-5">
        <button onClick={() => setMesOffset((p) => p + 1)} className="px-3 py-1.5 rounded-lg bg-surface-light text-muted text-xs">← Anterior</button>
        <p className="text-sm font-semibold capitalize">{getMonthName(mes)} {anio}</p>
        <button onClick={() => setMesOffset((p) => Math.max(0, p - 1))} disabled={mesOffset === 0}
          className="px-3 py-1.5 rounded-lg bg-surface-light text-muted text-xs disabled:opacity-30">Siguiente →</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted mb-1">Ingresos</p>
          <p className="text-sm font-bold text-success">{formatMoney(totalIngresos)}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted mb-1">Gastos</p>
          <p className="text-sm font-bold text-danger">{formatMoney(totalGastos)}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted mb-1">Balance</p>
          <p className={`text-sm font-bold ${totalIngresos - totalGastos >= 0 ? "text-success" : "text-danger"}`}>
            {formatMoney(totalIngresos - totalGastos)}
          </p>
        </div>
      </div>

      {movimientos.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-muted text-sm">No hay datos para este mes</p>
        </div>
      ) : (
        <>
          {/* Bar Chart */}
          <div className="glass-card p-4 mb-5">
            <h2 className="text-sm font-semibold mb-4">Ingresos vs Gastos</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#F9FAFB", fontSize: 12 }}
                  formatter={(value) => formatMoney(Number(value))}
                />
                <Bar dataKey="monto" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          {categoriaData.length > 0 && (
            <div className="glass-card p-4 mb-5">
              <h2 className="text-sm font-semibold mb-4">Gastos por categoría</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoriaData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {categoriaData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#F9FAFB", fontSize: 12 }}
                    formatter={(value) => formatMoney(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="space-y-2 mt-3">
                {categoriaData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs">{getCategoryIcon(cat.name)} {cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium">{formatMoney(cat.value)}</span>
                      <span className="text-[10px] text-muted ml-2">
                        {totalGastos > 0 ? Math.round((cat.value / totalGastos) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
