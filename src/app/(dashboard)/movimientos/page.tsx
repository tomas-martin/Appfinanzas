"use client";

import { useEffect, useState } from "react";
import { Trash2, X, Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon, getMonthName } from "@/lib/utils";
import { type Moneda } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Mov {
  _id: string; tipo: string; monto: number; moneda: Moneda;
  montoARS?: number; descripcion: string; categoria: string; fecha: string;
}

export default function MovimientosPage() {
  const router = useRouter();
  const [movimientos, setMovimientos] = useState<Mov[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "gasto" | "ingreso">("todos");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Mov>>({});
  const [busqueda, setBusqueda] = useState("");
  const [mes, setMes] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => { fetchMovimientos(); }, [mes, anio]);

  async function fetchMovimientos() {
    setLoading(true);
    try {
      const res = await fetch(`/api/movimientos?mes=${mes}&anio=${anio}`, { cache: "no-store" });
      setMovimientos(Array.isArray(await res.json()) ? await res.json() : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar?")) return;
    await fetch(`/api/movimientos/${id}`, { method: "DELETE" });
    setMovimientos(p => p.filter(m => m._id !== id));
  }

  async function handleEdit(id: string) {
    await fetch(`/api/movimientos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData) });
    setEditId(null); fetchMovimientos();
  }

  const changeMonth = (d: number) => {
    let m = mes + d, y = anio;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setMes(m); setAnio(y);
  };

  const filtered = movimientos
    .filter(m => filtro === "todos" ? true : m.tipo === filtro)
    .filter(m => m.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

  const total = filtered.reduce((s, m) => m.tipo === "ingreso" ? s + (m.montoARS || m.monto) : s - (m.montoARS || m.monto), 0);

  return (
    <div className="page fade-up">

      {/* ─ Header ──────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-icon"><ChevronLeft size={17} /></button>
          <h1 className="text-lg font-bold">Actividad</h1>
        </div>
        <Link href="/nuevo" className="btn-icon btn-icon-round" style={{ background: "var(--color-accent)", color: "#fff", border: "none" }}>
          <Plus size={18} strokeWidth={2.5} />
        </Link>
      </div>

      {/* ─ Month selector ─────────────── */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={() => changeMonth(-1)} className="btn-icon"><ChevronLeft size={16} /></button>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
          {getMonthName(mes)} {anio}
        </p>
        <button onClick={() => changeMonth(1)} className="btn-icon"><ChevronRight size={16} /></button>
      </div>

      {/* ─ Search ─────────────────────── */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
        <input type="text" placeholder="Buscar movimientos…"
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="input" style={{ paddingLeft: "2.5rem" }} />
      </div>

      {/* ─ Filters + total ────────────── */}
      <div className="flex items-center gap-2 mb-5">
        {(["todos", "ingreso", "gasto"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`chip ${filtro === f ? "active" : ""}`}>
            {f === "todos" ? "Todo" : f === "ingreso" ? "Ingresos" : "Gastos"}
          </button>
        ))}
        <div className="ml-auto text-right">
          <p className="text-sm font-bold" style={{ color: total >= 0 ? "var(--color-green)" : "var(--color-red)" }}>
            {formatMoney(Math.abs(total))}
          </p>
          <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>{filtered.length} items</p>
        </div>
      </div>

      {/* ─ List ───────────────────────── */}
      <div className="space-y-2 pb-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-4 h-4 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
          </div>
        ) : !filtered.length ? (
          <div className="card card-static text-center py-10">
            <p className="section-label">Sin movimientos</p>
          </div>
        ) : filtered.map(mov => (
          <div key={mov._id} onClick={() => editId !== mov._id && setEditId(mov._id)}
            className={`card cursor-pointer ${editId === mov._id ? "card-static" : ""}`}
            style={editId === mov._id ? { background: "var(--color-surface-2)", outline: "1px solid rgba(108,99,255,0.2)" } : {}}>
            {editId === mov._id ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="section-label" style={{ color: "var(--color-accent)" }}>Editar</p>
                  <button onClick={e => { e.stopPropagation(); setEditId(null); }} className="btn-icon w-7 h-7"><X size={13} /></button>
                </div>
                <input autoFocus className="input" style={{ height: "44px" }}
                  value={editData.descripcion ?? mov.descripcion}
                  onChange={e => setEditData({ ...editData, descripcion: e.target.value })} />
                <input className="input" type="number" style={{ height: "44px" }}
                  value={editData.monto ?? mov.monto}
                  onChange={e => setEditData({ ...editData, monto: Number(e.target.value) })} />
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); handleEdit(mov._id); }} className="btn btn-primary" style={{ height: "42px", fontSize: "0.82rem" }}>Guardar</button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(mov._id); }} className="btn btn-danger shrink-0" style={{ width: "42px", height: "42px", padding: 0 }}><Trash2 size={15} /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: "var(--color-surface-2)" }}>
                  {getCategoryIcon(mov.categoria)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{mov.descripcion}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                    {formatDateShort(mov.fecha)} · {mov.categoria}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: mov.tipo === "ingreso" ? "var(--color-green)" : "var(--color-text)" }}>
                    {mov.tipo === "ingreso" ? "+" : "−"}{formatMoney(mov.monto)}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--color-muted-2)", fontFamily: "monospace" }}>{mov.moneda}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}