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
  const labelClass = "text-[11px] font-bold text-muted uppercase tracking-[0.3em] mb-3.5 ml-4 block";

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
        ...(tab === "fijo" && { 
          nombre: descripcion,
          diaVencimiento: Number(diaVencimiento) 
        }),
        ...(tab === "tarjeta" && { 
          cantidadCuotas: Number(cantidadCuotas), 
          tasaInteres: Number(tasaInteres),
          tarjeta,
          diaVencimiento: Number(diaVencimiento),
          fechaInicio: fecha,
          montoTotal: montoNum,
          montoPorCuota: montoNum / Number(cantidadCuotas)
        })
      };

      const endpoint = tab === "fijo" ? "/api/gastos-fijos" : tab === "tarjeta" ? "/api/compras" : "/api/movimientos";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tab === "ingreso" ? { ...payload, tipo: "ingreso" } : tab === "gasto" ? { ...payload, tipo: "gasto" } : payload),
      });

      if (res.ok) router.push("/");
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  return (
    <div className="container-mobile pb-24 fade-up">
      <div className="flex items-center gap-4.5 mt-6 mb-8 px-1">
        <button onClick={() => router.back()} className="p-3.5 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
          <ChevronLeft className="w-5.5 h-5.5" />
        </button>
        <h1 className="text-3xl font-extrabold tracking-tighter">Registrar</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1 px-1">
        {(["gasto", "ingreso", "fijo", "tarjeta"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-7 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
              tab === t ? "bg-white border-white text-black shadow-lg" : "bg-white/5 border-white/5 text-muted"
            }`}>
            {t === "gasto" ? "Gasto" : t === "ingreso" ? "Ingreso" : t === "fijo" ? "Servicio" : "Tarjeta"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 px-1">
        <div>
          <label className={labelClass}>Descripción</label>
          <input required type="text" placeholder="Ej: Supermercado" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="input-premium py-4 text-base" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Monto</label>
            <input required type="number" step="any" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} className="input-premium py-4 text-lg font-black" />
          </div>
          <div>
            <label className={labelClass}>Moneda</label>
            <select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)} className="input-premium py-4 text-base">
              <option value="ARS">ARS (Pesos)</option>
              <option value="USD">USD (Dólar)</option>
            </select>
          </div>
        </div>

        {moneda === "USD" && (
          <div className="mx-2 p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Simulación a Pesos</p>
            <p className="text-xl font-black text-white">{formatMoney(montoARS)}</p>
            <p className="text-[8px] font-medium text-white/40 mt-1 uppercase tracking-widest">Cambio: $1.420</p>
          </div>
        )}

        <div>
          <label className={labelClass}>Categoría</label>
          <div className="grid grid-cols-3 gap-2.5">
            {categorias.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategoria(cat)}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-[2rem] border transition-all ${
                  categoria === cat ? "bg-white border-white text-black shadow-lg" : "bg-white/5 border-white/5 text-white"
                }`}>
                <span className="text-xl">{getCategoryIcon(cat)}</span>
                <span className="text-[8.5px] font-bold uppercase tracking-tighter text-center leading-tight">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {tab === "fijo" && (
          <div>
            <label className={labelClass}>Día de Vencimiento</label>
            <input type="number" min="1" max="31" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} className="input-premium py-4 text-base" />
          </div>
        )}

        {tab === "tarjeta" && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Nombre de Tarjeta</label>
              <input type="text" placeholder="Ej: Visa Santander" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} className="input-premium py-4 text-base" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Cuotas Totales</label>
                <input type="number" min="1" value={cantidadCuotas} onChange={(e) => setCantidadCuotas(e.target.value)} className="input-premium py-4 text-base" />
              </div>
              <div>
                <label className={labelClass}>Día de Pago</label>
                <input type="number" min="1" max="31" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} className="input-premium py-4 text-base" />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 pb-12">
          <button type="submit" disabled={saving} className="btn-primary w-full py-5 text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
            {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Confirmar Registro"}
          </button>
        </div>
      </form>
    </div>
  );
}

function getCategoryIcon(cat: string) {
  const icons: Record<string, string> = {
    "Comida": "🍔", "Transporte": "🚗", "Salud": "💊", "Ocio": "🎬", "Servicios": "💡", "Otros": "📦", "Tarjetas": "💳", "Inversiones": "📈",
    "Sueldo": "💰", "Ventas": "🤝", "Freelance": "💻", "Regalos": "🎁"
  };
  return icons[cat] || "📍";
}
