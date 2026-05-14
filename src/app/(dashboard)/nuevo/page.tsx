"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, type Moneda } from "@/types";
import { getDolarBlue } from "@/lib/currency";
import { formatMoney, getCategoryIcon } from "@/lib/utils";

type TabType = "gasto" | "ingreso" | "fijo" | "tarjeta";

const TABS: { id: TabType; label: string }[] = [
  { id: "gasto", label: "Gasto" },
  { id: "ingreso", label: "Ingreso" },
  { id: "fijo", label: "Servicio" },
  { id: "tarjeta", label: "Tarjeta" },
];

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
  const montoNum = Number(monto) || 0;
  const montoARS = moneda === "USD" ? montoNum * tipoCambio : montoNum;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        monto: montoNum, moneda,
        tipoCambio: moneda === "USD" ? tipoCambio : 1,
        montoARS, descripcion, categoria, fecha,
        ...(tab === "fijo" && { nombre: descripcion, diaVencimiento: Number(diaVencimiento) }),
        ...(tab === "tarjeta" && {
          cantidadCuotas: Number(cantidadCuotas), tasaInteres: Number(tasaInteres),
          tarjeta, diaVencimiento: Number(diaVencimiento),
          fechaInicio: fecha, montoTotal: montoNum,
          montoPorCuota: montoNum / Number(cantidadCuotas),
        }),
      };
      const endpoint = tab === "fijo" ? "/api/gastos-fijos" : tab === "tarjeta" ? "/api/compras" : "/api/movimientos";
      const res = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          tab === "ingreso" ? { ...payload, tipo: "ingreso" }
            : tab === "gasto" ? { ...payload, tipo: "gasto" }
              : payload
        ),
      });
      if (res.ok) router.push("/");
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  return (
    <div className="container-mobile fade-up pt-6 pb-36">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-[--color-surface] border border-[--color-border] flex items-center justify-center active:scale-90 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">Registrar</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setCategoria(""); }}
            className={`chip flex-shrink-0 ${tab === t.id ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Descripción */}
        <div>
          <label className="label">Descripción</label>
          <input
            required type="text" placeholder="Ej: Supermercado"
            value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
            className="input-premium"
          />
        </div>

        {/* Monto + Moneda */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Monto</label>
            <input
              required type="number" step="any" placeholder="0.00"
              value={monto} onChange={(e) => setMonto(e.target.value)}
              className="input-premium text-xl font-bold"
            />
          </div>
          <div>
            <label className="label">Moneda</label>
            <select
              value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)}
              className="input-premium"
            >
              <option value="ARS">ARS — Pesos</option>
              <option value="USD">USD — Dólar</option>
            </select>
          </div>
        </div>

        {/* Conversión USD */}
        {moneda === "USD" && montoNum > 0 && (
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[--color-primary-dim] border border-[--color-primary]/20">
            <div>
              <p className="text-[10px] font-bold text-[--color-primary] uppercase tracking-wider mb-0.5">
                Equivalente en pesos
              </p>
              <p className="text-base font-bold">{formatMoney(montoARS)}</p>
            </div>
            <p className="text-xs text-[--color-muted]">
              1 USD = ${tipoCambio.toLocaleString("es-AR")}
            </p>
          </div>
        )}

        {/* Categorías */}
        <div>
          <label className="label">Categoría</label>
          <div className="grid grid-cols-3 gap-2">
            {categorias.map((cat) => (
              <button
                key={cat} type="button" onClick={() => setCategoria(cat)}
                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 ${categoria === cat
                    ? "bg-[--color-foreground] border-[--color-foreground] text-[--color-background]"
                    : "bg-[--color-surface] border-[--color-border] text-[--color-foreground]"
                  }`}
              >
                <span className="text-2xl leading-none">{getCategoryIcon(cat)}</span>
                <span className="text-[10px] font-bold uppercase tracking-tight text-center leading-tight">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="label">Fecha</label>
          <input
            type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
            className="input-premium"
          />
        </div>

        {/* Extras fijo */}
        {tab === "fijo" && (
          <div>
            <label className="label">Día de vencimiento</label>
            <input
              type="number" min="1" max="31"
              value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)}
              className="input-premium"
            />
          </div>
        )}

        {/* Extras tarjeta */}
        {tab === "tarjeta" && (
          <div className="space-y-4">
            <div>
              <label className="label">Nombre de tarjeta</label>
              <input
                type="text" placeholder="Ej: Visa Santander"
                value={tarjeta} onChange={(e) => setTarjeta(e.target.value)}
                className="input-premium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cuotas</label>
                <input type="number" min="1" value={cantidadCuotas} onChange={(e) => setCantidadCuotas(e.target.value)} className="input-premium" />
              </div>
              <div>
                <label className="label">Día de pago</label>
                <input type="number" min="1" max="31" value={diaVencimiento} onChange={(e) => setDiaVencimiento(e.target.value)} className="input-premium" />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button type="submit" disabled={saving || !categoria} className="btn-primary py-4">
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Check className="w-4 h-4" /> Confirmar registro</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}