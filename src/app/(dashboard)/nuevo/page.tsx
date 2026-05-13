"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, DollarSign, Wallet, CreditCard, CalendarClock, TrendingUp } from "lucide-react";
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
  
  const inputClass = "w-full bg-white/[0.02] backdrop-blur-3xl rounded-[1.5rem] px-6 py-5 text-base text-foreground border border-white/5 focus:border-primary/40 placeholder:text-muted/20 transition-all shadow-inner outline-none";
  const labelClass = "text-[10px] font-black text-muted/40 uppercase tracking-[0.3em] mb-3 ml-2 block";

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

  const tabs = [
    { id: "gasto", label: "Gasto", icon: Wallet },
    { id: "ingreso", label: "Ingreso", icon: TrendingUp },
    { id: "fijo", label: "Fijo", icon: CalendarClock },
    { id: "tarjeta", label: "Cuotas", icon: CreditCard },
  ] as const;

  return (
    <div className="container-mobile pt-14 pb-44 fade-in">
      <div className="flex items-center justify-between mb-12 px-1">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 text-muted/40 active:scale-90 transition-transform shadow-xl">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-muted/30 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Registrar</p>
            <h1 className="text-3xl font-black tracking-tighter">Nuevo {tab}</h1>
          </div>
        </div>
      </div>

      <div className="flex gap-2 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-2 mb-12 border border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setCategoria(""); }}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-[2rem] text-xs font-black transition-all uppercase tracking-widest whitespace-nowrap ${tab === t.id ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted/30 hover:text-muted/60"}`}>
            <t.icon className={`w-4 h-4 ${tab === t.id ? "stroke-[3px]" : "stroke-[2px]"}`} />
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="glass-card p-10 space-y-10 shadow-2xl border-white/5">
          <div className="space-y-2">
            <label className={labelClass}>{tab === "fijo" ? "Nombre del servicio" : "Descripción del registro"}</label>
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder={tab === "fijo" ? "Netflix, Gimnasio, Alquiler..." : "¿En qué gastaste?"} required className={inputClass} />
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-2">
              <label className={labelClass}>Monto</label>
              <div className="relative">
                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" required min="0" step="0.01" className={`${inputClass} pl-12 text-2xl font-black tracking-tight`} />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted/30 text-xl font-black">$</span>
              </div>
            </div>
            <div className="col-span-4 space-y-2">
              <label className={labelClass}>Moneda</label>
              <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} className={`${inputClass} font-black tracking-widest text-center`}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {moneda === "USD" && (
            <div className="p-8 rounded-[2rem] bg-primary/[0.03] border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Cotización Blue
                </span>
                <span className="text-[11px] font-black text-primary/40 bg-primary/5 px-3 py-1 rounded-full">1 USD = ${tipoCambio}</span>
              </div>
              <div className="text-4xl font-black text-white tracking-tighter">
                ≈ ${montoARS.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-sm ml-2 font-black text-primary uppercase tracking-widest opacity-60">ARS</span>
              </div>
              {loadingDolar && <div className="text-[10px] font-black text-muted/30 uppercase tracking-widest animate-pulse mt-3">Actualizando mercado...</div>}
            </div>
          )}

          <div className="space-y-4">
            <label className={labelClass}>Selecciona una Categoría</label>
            <div className="grid grid-cols-2 gap-4">
              {categorias.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategoria(cat)}
                  className={`px-6 py-5 rounded-2xl text-[11px] font-black transition-all border uppercase tracking-widest ${categoria === cat ? "bg-primary border-primary text-white shadow-2xl shadow-primary/30 scale-[1.02]" : "bg-white/[0.02] border-white/5 text-muted/30 hover:bg-white/[0.05] active:scale-[0.98]"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-10 space-y-10 shadow-2xl border-white/5">
          {tab !== "fijo" && (
            <div className="space-y-2">
              <label className={labelClass}>Fecha de operación</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={`${inputClass} [color-scheme:dark] font-black tracking-widest`} />
            </div>
          )}

          {tab === "fijo" && (
            <div className="space-y-2">
              <label className={labelClass}>Día de vencimiento mensual</label>
              <input type="number" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} min="1" max="31" className={`${inputClass} font-black text-xl`} />
            </div>
          )}

          {tab === "tarjeta" && (
            <div className="space-y-10">
              <div className="space-y-2">
                <label className={labelClass}>Nombre de la Tarjeta</label>
                <input type="text" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} placeholder="Visa Black, MasterCard Gold..." required className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>Cantidad de Cuotas</label>
                  <input type="number" value={cantidadCuotas} onChange={(e) => setCantidadCuotas(e.target.value)} min="1" max="48" className={`${inputClass} font-black text-xl`} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Interés Anual %</label>
                  <input type="number" value={tasaInteres} onChange={(e) => setTasaInteres(e.target.value)} min="0" step="0.1" className={`${inputClass} font-black text-xl`} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4">
          <button type="submit" disabled={saving || !descripcion || !monto || !categoria}
            className="w-full bg-primary hover:bg-primary-dark text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale transition-all duration-500 shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.5)] active:scale-[0.96] text-sm">
            {saving ? <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-6 h-6 stroke-[4px]" /> Confirmar registro</>}
          </button>
        </div>
      </form>
    </div>
  );
}
