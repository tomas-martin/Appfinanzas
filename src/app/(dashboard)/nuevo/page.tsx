"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, type Moneda } from "@/types";

type TabType = "gasto" | "ingreso" | "fijo" | "tarjeta";

export default function NuevoPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("gasto");
  const [saving, setSaving] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("ARS");
  const [categoria, setCategoria] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [diaVencimiento, setDiaVencimiento] = useState("1");
  const [cantidadCuotas, setCantidadCuotas] = useState("1");
  const [tasaInteres, setTasaInteres] = useState("0");
  const [tarjeta, setTarjeta] = useState("");

  const categorias = tab === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const inputClass = "w-full bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-border placeholder:text-muted/50 transition-all";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (tab === "gasto" || tab === "ingreso") {
        await fetch("/api/movimientos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: tab, monto: Number(monto), moneda, descripcion, categoria, fecha }),
        });
      } else if (tab === "fijo") {
        await fetch("/api/gastos-fijos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: descripcion, monto: Number(monto), moneda, diaVencimiento: Number(diaVencimiento), categoria, activo: true }),
        });
      } else if (tab === "tarjeta") {
        const total = Number(monto) * (1 + Number(tasaInteres) / 100);
        await fetch("/api/compras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descripcion, montoTotal: Number(monto), moneda, cantidadCuotas: Number(cantidadCuotas), cuotasPagadas: 0, montoPorCuota: total / Number(cantidadCuotas), tasaInteres: Number(tasaInteres), tarjeta, fechaInicio: fecha, categoria }),
        });
      }
      router.push("/");
      router.refresh();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  return (
    <div className="px-4 pt-6 fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-surface-light text-muted"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Nuevo registro</h1>
      </div>

      <div className="flex gap-1 bg-surface rounded-xl p-1 mb-6">
        {([{ key: "gasto", label: "Gasto" }, { key: "ingreso", label: "Ingreso" }, { key: "fijo", label: "Fijo" }, { key: "tarjeta", label: "Tarjeta" }] as const).map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setCategoria(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.key ? "bg-primary text-white shadow-md" : "text-muted"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-muted mb-1.5 block">{tab === "fijo" ? "Nombre" : "Descripción"}</label>
          <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder={tab === "fijo" ? "Ej: Alquiler..." : "¿En qué gastaste?"} required className={inputClass} />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted mb-1.5 block">Monto</label>
            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" required min="0" step="0.01" className={inputClass} />
          </div>
          <div className="w-24">
            <label className="text-xs text-muted mb-1.5 block">Moneda</label>
            <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} className={inputClass}>
              <option value="ARS">ARS $</option>
              <option value="USD">USD $</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted mb-1.5 block">Categoría</label>
          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategoria(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoria === cat ? "bg-primary text-white" : "bg-surface-light text-muted"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {tab !== "fijo" && (
          <div>
            <label className="text-xs text-muted mb-1.5 block">Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
          </div>
        )}

        {tab === "fijo" && (
          <div>
            <label className="text-xs text-muted mb-1.5 block">Día de vencimiento</label>
            <input type="number" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} min="1" max="31" className={inputClass} />
          </div>
        )}

        {tab === "tarjeta" && (
          <>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Tarjeta</label>
              <input type="text" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} placeholder="Ej: Visa..." required className={inputClass} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted mb-1.5 block">Cuotas</label>
                <input type="number" value={cantidadCuotas} onChange={(e) => setCantidadCuotas(e.target.value)} min="1" max="48" className={inputClass} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted mb-1.5 block">Interés %</label>
                <input type="number" value={tasaInteres} onChange={(e) => setTasaInteres(e.target.value)} min="0" step="0.1" className={inputClass} />
              </div>
            </div>
          </>
        )}

        <button type="submit" disabled={saving || !descripcion || !monto || !categoria}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-5 h-5" />Guardar</>}
        </button>
      </form>
    </div>
  );
}
