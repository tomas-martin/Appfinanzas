"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, type Moneda } from "@/types";
import { getDolarBlue } from "@/lib/currency";
import { formatMoney, getCategoryIcon } from "@/lib/utils";

type Tab = "gasto" | "ingreso" | "fijo" | "tarjeta";

const TABS: { id: Tab; label: string }[] = [
  { id: "gasto", label: "Gasto" },
  { id: "ingreso", label: "Ingreso" },
  { id: "fijo", label: "Servicio" },
  { id: "tarjeta", label: "Tarjeta" },
];

// Color accent per tab
const TAB_COLORS: Record<Tab, string> = {
  gasto: "var(--color-red)",
  ingreso: "var(--color-green)",
  fijo: "var(--color-accent)",
  tarjeta: "var(--color-amber)",
};

export default function NuevoPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("gasto");
  const [saving, setSaving] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("ARS");
  const [categoria, setCategoria] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [diaVencimiento, setDiaVencimiento] = useState("10");
  const [cantidadCuotas, setCantidadCuotas] = useState("1");
  const [tarjeta, setTarjeta] = useState("");
  const [tipoCambio, setTipoCambio] = useState(1420);

  useEffect(() => { getDolarBlue().then(r => setTipoCambio(r)); }, []);

  const categorias = tab === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const montoNum = Number(monto) || 0;
  const montoARS = moneda === "USD" ? montoNum * tipoCambio : montoNum;
  const accentColor = TAB_COLORS[tab];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        monto: montoNum, moneda, tipoCambio: moneda === "USD" ? tipoCambio : 1,
        montoARS, descripcion, categoria, fecha,
        ...(tab === "fijo" && { nombre: descripcion, diaVencimiento: Number(diaVencimiento) }),
        ...(tab === "tarjeta" && {
          cantidadCuotas: Number(cantidadCuotas), tasaInteres: 0, tarjeta,
          diaVencimiento: Number(diaVencimiento), fechaInicio: fecha,
          montoTotal: montoNum, montoPorCuota: montoNum / Number(cantidadCuotas),
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
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className="page fade-up pb-10">

      {/* ─ Header ─────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="btn-icon">
          <ChevronLeft size={17} />
        </button>
        <h1 className="text-lg font-bold">Registrar</h1>
      </div>

      {/* ─ Tab selector ───────────────── */}
      <div className="flex gap-2 mb-7 overflow-x-auto no-scrollbar pb-0.5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setCategoria(""); }}
            className="chip flex-shrink-0"
            style={tab === t.id ? { background: accentColor, borderColor: accentColor, color: t.id === "ingreso" || t.id === "tarjeta" ? "#000" : "#fff" } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ─ Monto grande ───────────────── */}
        <div>
          <label className="label">Monto</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{ color: "var(--color-muted-2)" }}>$</span>
            <input
              required type="number" step="any" placeholder="0"
              value={monto} onChange={e => setMonto(e.target.value)}
              className="input"
              style={{ paddingLeft: "2.4rem", height: "66px", fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.04em" }}
            />
          </div>
        </div>

        {/* ─ Moneda + conversión ────────── */}
        <div>
          <label className="label">Moneda</label>
          <select value={moneda} onChange={e => setMoneda(e.target.value as Moneda)} className="input">
            <option value="ARS">🇦🇷 Pesos (ARS)</option>
            <option value="USD">🇺🇸 Dólar (USD)</option>
          </select>
          {moneda === "USD" && montoNum > 0 && (
            <div className="flex items-center justify-between mt-2 px-4 py-2.5 rounded-2xl"
              style={{ background: "var(--color-accent-dim)", border: "1px solid rgba(108,99,255,0.2)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
                ≈ {formatMoney(montoARS)}
              </span>
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                1 USD = ${tipoCambio.toLocaleString("es-AR")}
              </span>
            </div>
          )}
        </div>

        {/* ─ Descripción ────────────────── */}
        <div>
          <label className="label">Descripción</label>
          <input
            required type="text" placeholder="Ej: Supermercado"
            value={descripcion} onChange={e => setDescripcion(e.target.value)}
            className="input"
          />
        </div>

        {/* ─ Categorías ─────────────────── */}
        <div>
          <label className="label">Categoría</label>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {categorias.map(cat => (
              <button
                key={cat} type="button"
                onClick={() => setCategoria(cat)}
                className={`cat-btn ${categoria === cat ? "selected" : ""}`}
              >
                <span style={{ fontSize: "22px", lineHeight: 1 }}>{getCategoryIcon(cat)}</span>
                <span className="cat-name">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─ Fecha ──────────────────────── */}
        <div>
          <label className="label">Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="input" />
        </div>

        {/* ─ Extras fijo ────────────────── */}
        {tab === "fijo" && (
          <div>
            <label className="label">Día de vencimiento</label>
            <input type="number" min="1" max="31" value={diaVencimiento}
              onChange={e => setDiaVencimiento(e.target.value)} className="input" />
          </div>
        )}

        {/* ─ Extras tarjeta ─────────────── */}
        {tab === "tarjeta" && (
          <div className="space-y-4">
            <div>
              <label className="label">Nombre de tarjeta</label>
              <input type="text" placeholder="Ej: Visa Santander" value={tarjeta}
                onChange={e => setTarjeta(e.target.value)} className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cuotas</label>
                <input type="number" min="1" value={cantidadCuotas}
                  onChange={e => setCantidadCuotas(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Día de pago</label>
                <input type="number" min="1" max="31" value={diaVencimiento}
                  onChange={e => setDiaVencimiento(e.target.value)} className="input" />
              </div>
            </div>
          </div>
        )}

        {/* ─ Preview card ───────────────── */}
        {categoria && descripcion && montoNum > 0 && (
          <div className="card card-static" style={{ borderColor: `${accentColor}33`, background: "var(--color-surface-2)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: "var(--color-surface-3)" }}>
                {getCategoryIcon(categoria)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{descripcion}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{categoria} · {moneda}</p>
              </div>
              <p className="text-sm font-bold shrink-0" style={{ color: accentColor }}>
                {tab === "ingreso" ? "+" : "−"}{formatMoney(montoNum, moneda)}
              </p>
            </div>
          </div>
        )}

        {/* ─ Submit ─────────────────────── */}
        <div className="pt-2 pb-6">
          <button
            type="submit"
            disabled={saving || !categoria}
            className="btn btn-primary"
            style={{ height: "56px", fontSize: "0.92rem", borderRadius: "16px", background: accentColor }}
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Check size={17} /> Confirmar registro</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}