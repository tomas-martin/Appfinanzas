"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Wallet, CreditCard, CalendarClock, TrendingUp } from "lucide-react";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, type Moneda } from "@/types";
import { getDolarBlue } from "@/lib/currency";
import { formatMoney } from "@/lib/utils";

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
  const [diaVencimiento, setDiaVencimiento] = useState("10");
  const [cantidadCuotas, setCantidadCuotas] = useState("1");
  const [tasaInteres, setTasaInteres] = useState("0");
  const [tarjeta, setTarjeta] = useState("");
  
  const [tipoCambio, setTipoCambio] = useState(1420);

  useEffect(() => {
    getDolarBlue().then((rate) => setTipoCambio(rate));
  }, []);

  const categorias = tab === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const labelClass = "text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-3 ml-4 block";

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
            diaVencimiento: Number(diaVencimiento),
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
    <div className="container-mobile fade-up">
      <div className="flex items-center gap-5 mb-10">
        <button onClick={() => router.back()} className="p-4 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-extrabold tracking-tighter">Registrar</h1>
      </div>

      <div className="flex gap-2 bg-[#0A0A0A] rounded-[2rem] p-1.5 mb-12 border border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setCategoria(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-[1.5rem] text-[9px] font-bold transition-all uppercase tracking-widest whitespace-nowrap ${tab === t.id ? "bg-white text-black shadow-xl" : "text-muted/30"}`}>
            <t.icon className="w-4 h-4 shrink-0" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">
          <div className="space-y-2">
            <label className={labelClass}>{tab === "fijo" ? "Servicio" : tab === "tarjeta" ? "Compra" : "Descripción"}</label>
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="..." required className="input-premium" />
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-8 space-y-2">
              <label className={labelClass}>Monto {moneda === "USD" && <span className="text-white/20 normal-case ml-2">≈ {formatMoney(montoARS)}</span>}</label>
              <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" required className="input-premium" />
            </div>
            <div className="col-span-4 space-y-2">
              <label className={labelClass}>Divisa</label>
              <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} className="input-premium text-center text-xs px-1">
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {tab === "tarjeta" && (
            <div className="space-y-8 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className={labelClass}>Primer Pago</label>
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input-premium text-[10px]" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Vence Día</label>
                  <input type="number" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} min="1" max="31" className="input-premium text-center" />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Nombre Tarjeta</label>
                <input type="text" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} placeholder="Visa, Amex..." required className="input-premium" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className={labelClass}>Cuotas</label>
                  <input type="number" value={cantidadCuotas} onChange={(e) => setCantidadCuotas(e.target.value)} min="1" className="input-premium" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Interés %</label>
                  <input type="number" value={tasaInteres} onChange={(e) => setTasaInteres(e.target.value)} min="0" className="input-premium" />
                </div>
              </div>
            </div>
          )}

          {tab === "fijo" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <label className={labelClass}>Día de Vencimiento</label>
              <input type="number" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} min="1" max="31" className="input-premium" />
            </div>
          )}

          <div className="space-y-4">
            <label className={labelClass}>Categoría</label>
            <div className="grid grid-cols-2 gap-2">
              {categorias.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategoria(cat)}
                  className={`px-5 py-3.5 rounded-2xl text-[10px] font-bold transition-all border uppercase tracking-widest ${categoria === cat ? "bg-white border-white text-black" : "bg-[#0A0A0A] border-white/5 text-muted hover:text-white"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving || !descripcion || !monto || !categoria}
          className="btn-premium py-5 disabled:opacity-20 transition-all shadow-2xl active:scale-[0.96] text-[10px] mb-8">
          {saving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" /> : "Confirmar Registro"}
        </button>
      </form>
    </div>
  );
}
