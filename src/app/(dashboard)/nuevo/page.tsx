"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, DollarSign, Wallet, CreditCard, CalendarClock, TrendingUp } from "lucide-react";
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

  useEffect(() => {
    if (moneda === "USD") {
      getDolarBlue().then((rate) => setTipoCambio(rate));
    }
  }, [moneda]);

  const categorias = tab === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  
  const inputClass = "w-full bg-[#0A0A0A] rounded-[1.5rem] px-8 py-6 text-lg font-bold text-white border border-white/5 focus:border-white/20 outline-none transition-all placeholder:text-muted/20";
  const labelClass = "text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-4 ml-4 block";

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
    <div className="container-mobile pt-safe-forced pb-safe-forced fade-up">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={() => router.back()} className="p-4 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-extrabold tracking-tighter">Registrar</h1>
      </div>

      <div className="flex gap-2 bg-[#0A0A0A] rounded-[2rem] p-2 mb-16 border border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setCategoria(""); }}
            className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 px-6 rounded-[1.5rem] text-[9px] font-bold transition-all uppercase tracking-widest whitespace-nowrap ${tab === t.id ? "bg-white text-black shadow-xl scale-105" : "text-muted/40"}`}>
            <t.icon className="w-5 h-5" />
            <span className={tab === t.id ? "opacity-100" : "opacity-40"}>{t.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">
        <div className="space-y-10">
          <div className="space-y-3">
            <label className={labelClass}>{tab === "fijo" ? "Nombre del Servicio" : "Descripción"}</label>
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="..." required className={inputClass} />
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-3">
              <label className={labelClass}>Monto</label>
              <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" required className={inputClass} />
            </div>
            <div className="col-span-4 space-y-3">
              <label className={labelClass}>Divisa</label>
              <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} className={`${inputClass} text-center text-sm px-2`}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <label className={labelClass}>Categoría</label>
            <div className="grid grid-cols-2 gap-3">
              {categorias.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategoria(cat)}
                  className={`px-6 py-5 rounded-2xl text-[10px] font-bold transition-all border uppercase tracking-widest ${categoria === cat ? "bg-white border-white text-black" : "bg-[#0A0A0A] border-white/5 text-muted hover:text-white"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {tab === "tarjeta" && (
            <div className="space-y-10 pt-6">
              <div className="space-y-3">
                <label className={labelClass}>Nombre de la Tarjeta</label>
                <input type="text" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} placeholder="Visa, Amex..." required className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className={labelClass}>Cuotas</label>
                  <input type="number" value={cantidadCuotas} onChange={(e) => setCantidadCuotas(e.target.value)} min="1" className={inputClass} />
                </div>
                <div className="space-y-3">
                  <label className={labelClass}>Interés %</label>
                  <input type="number" value={tasaInteres} onChange={(e) => setTasaInteres(e.target.value)} min="0" className={inputClass} />
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving || !descripcion || !monto || !categoria}
          className="w-full bg-white text-black py-8 rounded-[2.5rem] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-4 disabled:opacity-20 transition-all shadow-2xl active:scale-[0.96] text-xs">
          {saving ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : "Confirmar Registro"}
        </button>
      </form>
    </div>
  );
}
