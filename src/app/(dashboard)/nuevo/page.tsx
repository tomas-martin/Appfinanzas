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
  
  const inputClass = "w-full bg-white/[0.01] backdrop-blur-3xl rounded-[1.2rem] px-6 py-4 text-sm text-foreground border border-white/5 focus:border-primary/30 placeholder:text-muted/10 transition-all outline-none";
  const labelClass = "text-[9px] font-black text-muted/20 uppercase tracking-[0.4em] mb-3 ml-2 block";

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
    <div className="container-mobile pt-safe pb-nav fade-in">
      <div className="flex items-center justify-between mt-12 mb-16 px-1">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-3.5 rounded-[1.2rem] bg-white/[0.02] border border-white/5 text-muted/30 active:scale-90 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-muted/20 text-[8px] font-black uppercase tracking-[0.5em] mb-1">Registrar</p>
            <h1 className="text-2xl font-black tracking-tighter text-white/90">Nuevo {tab}</h1>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 bg-white/[0.01] rounded-[2rem] p-1.5 mb-16 border border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setCategoria(""); }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-[1.5rem] text-[9px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${tab === t.id ? "bg-white text-black shadow-xl" : "text-muted/20 hover:text-muted/40"}`}>
            <t.icon className={`w-3.5 h-3.5 ${tab === t.id ? "stroke-[3px]" : "stroke-[2px]"}`} />
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="glass-card p-10 space-y-12 shadow-2xl border-white/[0.03]">
          <div className="space-y-3">
            <label className={labelClass}>{tab === "fijo" ? "Nombre" : "Descripción"}</label>
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder={tab === "fijo" ? "Netflix, Gimnasio..." : "¿En qué?"} required className={inputClass} />
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-3">
              <label className={labelClass}>Monto</label>
              <div className="relative">
                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" required min="0" step="0.01" className={`${inputClass} pl-10 text-xl font-black tracking-tight`} />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted/20 text-lg font-black">$</span>
              </div>
            </div>
            <div className="col-span-4 space-y-3">
              <label className={labelClass}>Moneda</label>
              <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} className={`${inputClass} font-black tracking-widest text-center text-[10px]`}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {moneda === "USD" && (
            <div className="p-7 rounded-[1.5rem] bg-white/[0.01] border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black text-primary-light uppercase tracking-[0.3em] flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" /> Blue
                </span>
                <span className="text-[9px] font-black text-muted/20 bg-white/5 px-2.5 py-1 rounded-full">1 USD = ${tipoCambio}</span>
              </div>
              <div className="text-3xl font-black text-white/90 tracking-tighter">
                ≈ ${montoARS.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-[10px] ml-2 font-black text-muted/20 uppercase tracking-widest">ARS</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <label className={labelClass}>Categoría</label>
            <div className="grid grid-cols-2 gap-3">
              {categorias.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategoria(cat)}
                  className={`px-5 py-4 rounded-xl text-[9px] font-black transition-all border uppercase tracking-widest ${categoria === cat ? "bg-white border-white text-black shadow-xl scale-[1.02]" : "bg-white/[0.01] border-white/5 text-muted/20 hover:bg-white/[0.03]"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-10 space-y-12 shadow-2xl border-white/[0.03]">
          {tab !== "fijo" && (
            <div className="space-y-3">
              <label className={labelClass}>Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={`${inputClass} [color-scheme:dark] font-black tracking-widest text-xs`} />
            </div>
          )}

          {tab === "fijo" && (
            <div className="space-y-3">
              <label className={labelClass}>Día mensual</label>
              <input type="number" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} min="1" max="31" className={`${inputClass} font-black text-lg`} />
            </div>
          )}

          {tab === "tarjeta" && (
            <div className="space-y-12">
              <div className="space-y-3">
                <label className={labelClass}>Tarjeta</label>
                <input type="text" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} placeholder="Ej: Visa Black..." required className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className={labelClass}>Cuotas</label>
                  <input type="number" value={cantidadCuotas} onChange={(e) => setCantidadCuotas(e.target.value)} min="1" max="48" className={`${inputClass} font-black text-lg`} />
                </div>
                <div className="space-y-3">
                  <label className={labelClass}>Interés %</label>
                  <input type="number" value={tasaInteres} onChange={(e) => setTasaInteres(e.target.value)} min="0" step="0.1" className={`${inputClass} font-black text-lg`} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-8">
          <button type="submit" disabled={saving || !descripcion || !monto || !categoria}
            className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 transition-all duration-500 shadow-2xl active:scale-[0.96] text-[10px]">
            {saving ? <div className="w-5 h-5 border-[2px] border-black/20 border-t-black rounded-full animate-spin" /> : <><Check className="w-5 h-5 stroke-[4px]" /> Confirmar</>}
          </button>
        </div>
      </form>
    </div>
  );
}
