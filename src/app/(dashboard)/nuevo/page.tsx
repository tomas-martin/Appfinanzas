"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, DollarSign } from "lucide-react";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, type Moneda } from "@/types";
import { getDolarBlue } from "@/lib/currency";

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
  
  const [tipoCambio, setTipoCambio] = useState(1420);
  const [loadingDolar, setLoadingDolar] = useState(false);

  useEffect(() => {
    if (moneda === "USD") {
      setLoadingDolar(true);
      getDolarBlue().then((rate) => {
        setTipoCambio(rate);
        setLoadingDolar(false);
      });
    }
  }, [moneda]);

  const categorias = tab === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  
  const inputClass = "w-full bg-surface-light/50 backdrop-blur-sm rounded-2xl px-5 py-4 text-base text-foreground border border-white/5 focus:border-primary/50 placeholder:text-muted/30 transition-all shadow-inner";
  const labelClass = "text-sm font-semibold text-muted/80 mb-2 ml-1 block";

  const montoNum = Number(monto) || 0;
  const montoARS = moneda === "USD" ? montoNum * tipoCambio : montoNum;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        monto: montoNum,
        moneda,
        tipoCambio: moneda === "USD" ? tipoCambio : 1,
        montoARS: montoARS,
        descripcion,
        categoria,
        fecha,
      };

      if (tab === "gasto" || tab === "ingreso") {
        await fetch("/api/movimientos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, tipo: tab }),
        });
      } else if (tab === "fijo") {
        await fetch("/api/gastos-fijos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            nombre: descripcion, 
            monto: montoNum, 
            moneda, 
            tipoCambio: moneda === "USD" ? tipoCambio : 1,
            montoARS,
            diaVencimiento: Number(diaVencimiento), 
            categoria, 
            activo: true 
          }),
        });
      } else if (tab === "tarjeta") {
        const total = montoNum * (1 + Number(tasaInteres) / 100);
        const totalARS = montoARS * (1 + Number(tasaInteres) / 100);
        await fetch("/api/compras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            descripcion, 
            montoTotal: montoNum, 
            moneda, 
            tipoCambio: moneda === "USD" ? tipoCambio : 1,
            montoARS,
            cantidadCuotas: Number(cantidadCuotas), 
            cuotasPagadas: 0, 
            montoPorCuota: total / Number(cantidadCuotas), 
            tasaInteres: Number(tasaInteres), 
            tarjeta, 
            fechaInicio: fecha, 
            categoria 
          }),
        });
      }
      router.push("/");
      router.refresh();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  return (
    <div className="container-mobile pt-8 pb-32 fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-3 rounded-2xl bg-surface-light text-muted active:scale-90 transition-transform shadow-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black gradient-text uppercase tracking-tight">Nuevo registro</h1>
      </div>

      <div className="flex gap-1 bg-surface/50 backdrop-blur-xl rounded-2xl p-1.5 mb-8 border border-white/5 shadow-xl">
        {(["gasto", "ingreso", "fijo", "tarjeta"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setCategoria(""); }}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${tab === t ? "btn-primary text-white" : "text-muted/60 hover:text-muted"}`}>
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-6">
          <div>
            <label className={labelClass}>{tab === "fijo" ? "Nombre del gasto" : "Descripción"}</label>
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder={tab === "fijo" ? "Ej: Netflix, Alquiler..." : "¿En qué fue?"} required className={inputClass} />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>Monto</label>
              <div className="relative">
                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" required min="0" step="0.01" className={`${inputClass} pl-10`} />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50 font-bold">$</span>
              </div>
            </div>
            <div className="w-32">
              <label className={labelClass}>Moneda</label>
              <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} className={inputClass}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {moneda === "USD" && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Conversión Blue
                </span>
                <span className="text-[10px] text-primary/60">1 USD = ${tipoCambio}</span>
              </div>
              <div className="text-2xl font-black text-primary">
                ≈ ${montoARS.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs ml-1 font-medium opacity-70 text-foreground">ARS</span>
              </div>
              {loadingDolar && <div className="text-[10px] text-muted animate-pulse mt-1">Actualizando cotización...</div>}
            </div>
          )}

          <div>
            <label className={labelClass}>Categoría</label>
            <div className="grid grid-cols-2 gap-2">
              {categorias.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategoria(cat)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${categoria === cat ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" : "bg-surface-light/30 border-white/5 text-muted/70 hover:bg-surface-light/50"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          {tab !== "fijo" && (
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
            </div>
          )}

          {tab === "fijo" && (
            <div>
              <label className={labelClass}>Día de vencimiento (cada mes)</label>
              <input type="number" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} min="1" max="31" className={inputClass} />
            </div>
          )}

          {tab === "tarjeta" && (
            <>
              <div>
                <label className={labelClass}>Tarjeta utilizada</label>
                <input type="text" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} placeholder="Visa, Master, etc..." required className={inputClass} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelClass}>Cuotas</label>
                  <input type="number" value={cantidadCuotas} onChange={(e) => setCantidadCuotas(e.target.value)} min="1" max="48" className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Interés %</label>
                  <input type="number" value={tasaInteres} onChange={(e) => setTasaInteres(e.target.value)} min="0" step="0.1" className={inputClass} />
                </div>
              </div>
            </>
          )}
        </div>

        <button type="submit" disabled={saving || !descripcion || !monto || !categoria}
          className="w-full btn-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-primary/40 text-lg">
          {saving ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-6 h-6 stroke-[3px]" /> Confirmar Registro</>}
        </button>
      </form>
    </div>
  );
}
