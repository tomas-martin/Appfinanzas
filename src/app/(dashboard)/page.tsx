"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ArrowUpRight, ArrowDownRight, CreditCard, CalendarClock, X, Trash2, LogOut, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { formatMoney, getCategoryIcon, getMonthName, formatDateShort } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  balance: number; ingresos: number; gastos: number;
  cuotasPendientes: number; proximosVencimientos: any[];
  ultimosMovimientos: any[]; metasCount?: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [mes, setMes] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, [mes, anio]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/movimientos/dashboard?mes=${mes}&anio=${anio}`, { cache: "no-store" });
      setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar?")) return;
    await fetch(`/api/movimientos/${id}`, { method: "DELETE" });
    setEditId(null); fetchData();
  }

  async function handleEdit(id: string) {
    await fetch(`/api/movimientos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData) });
    setEditId(null); fetchData();
  }

  const changeMonth = (d: number) => {
    let m = mes + d, y = anio;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setMes(m); setAnio(y);
  };

  const firstName = session?.user?.name?.split(" ")[0] || "Usuario";

  if (loading && !data) return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="page fade-up">

      {/* ─ Header ──────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {session?.user?.image && (
            <div className="relative shrink-0">
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[--color-green] border-2 border-[--color-bg]" />
            </div>
          )}
          <p className="text-sm font-medium text-[--color-muted]">
            Hola, <span className="text-[--color-text] font-semibold">{firstName}</span>
          </p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-icon btn-icon-round">
          <LogOut size={15} />
        </button>
      </div>

      {/* ─ Month selector ─────────────── */}
      <div className="flex items-center justify-between mb-5 px-1">
        <button onClick={() => changeMonth(-1)} className="btn-icon">
          <ChevronLeft size={16} />
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-[--color-muted]">
          {getMonthName(mes)} {anio}
        </p>
        <button onClick={() => changeMonth(1)} className="btn-icon">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─ Balance hero ───────────────── */}
      <div className="text-center mb-6 py-2">
        <p className="section-label mb-3">Balance acumulado</p>
        <p
          className="font-bold tracking-tight leading-none mb-4 transition-all duration-300"
          style={{
            fontSize: "clamp(2rem,9vw,2.8rem)",
            letterSpacing: "-0.04em",
            opacity: loading ? 0.3 : 1,
          }}
        >
          {formatMoney(data?.balance || 0)}
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="stat-pill" style={{ background: "var(--color-green-dim)", color: "var(--color-green)" }}>
            <ArrowUpRight size={13} />
            {formatMoney(data?.ingresos || 0)}
          </span>
          <span className="stat-pill" style={{ background: "var(--color-red-dim)", color: "var(--color-red)" }}>
            <ArrowDownRight size={13} />
            {formatMoney(data?.gastos || 0)}
          </span>
        </div>
      </div>

      {/* ─ Quick cards ────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Link href="/tarjetas" className="card flex flex-col gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent-dim)" }}>
            <CreditCard size={16} style={{ color: "var(--color-accent)" }} />
          </div>
          <div>
            <p className="section-label mb-1">Tarjetas</p>
            <p className="text-base font-bold">{formatMoney(data?.cuotasPendientes || 0)}</p>
          </div>
        </Link>
        <Link href="/gastos-fijos" className="card flex flex-col gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent-dim)" }}>
            <CalendarClock size={16} style={{ color: "var(--color-accent)" }} />
          </div>
          <div>
            <p className="section-label mb-1">Fijos</p>
            <p className="text-base font-bold">{data?.proximosVencimientos.length || 0} pagos</p>
          </div>
        </Link>
      </div>

      <Link href="/metas" className="card card-static flex items-center gap-3 mb-7">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-dim)" }}>
          <Target size={16} style={{ color: "var(--color-accent)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="section-label mb-0.5">Metas de ahorro</p>
          <p className="text-sm font-semibold">{data?.metasCount || 0} activas</p>
        </div>
        <ChevronRight size={15} style={{ color: "var(--color-muted)" }} className="shrink-0" />
      </Link>

      {/* ─ Movements ──────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="section-label">{getMonthName(mes)}</p>
          <Link href="/movimientos" className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
            Ver todo
          </Link>
        </div>

        <div className="space-y-2 pb-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-4 h-4 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
            </div>
          ) : !data?.ultimosMovimientos.length ? (
            <div className="card card-static text-center py-8">
              <p className="section-label">Sin actividad</p>
            </div>
          ) : data.ultimosMovimientos.map((mov: any) => (
            <div
              key={mov._id}
              onClick={() => editId !== mov._id && setEditId(mov._id)}
              className={`card cursor-pointer ${editId === mov._id ? "card-static" : ""}`}
              style={editId === mov._id ? { background: "var(--color-surface-2)", outline: "1px solid rgba(108,99,255,0.2)" } : {}}
            >
              {editId === mov._id ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="section-label" style={{ color: "var(--color-accent)" }}>Editar</p>
                    <button onClick={e => { e.stopPropagation(); setEditId(null); }} className="btn-icon w-7 h-7">
                      <X size={13} />
                    </button>
                  </div>
                  <input autoFocus className="input" style={{ height: "44px" }}
                    value={editData.descripcion ?? mov.descripcion}
                    onChange={e => setEditData({ ...editData, descripcion: e.target.value })} />
                  <input className="input" type="number" style={{ height: "44px" }}
                    value={editData.monto ?? mov.monto}
                    onChange={e => setEditData({ ...editData, monto: Number(e.target.value) })} />
                  <div className="flex gap-2 pt-1">
                    <button onClick={e => { e.stopPropagation(); handleEdit(mov._id); }} className="btn btn-primary" style={{ height: "42px", fontSize: "0.82rem" }}>
                      Guardar
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(mov._id); }} className="btn btn-danger shrink-0" style={{ width: "42px", height: "42px", padding: 0 }}>
                      <Trash2 size={15} />
                    </button>
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
    </div>
  );
}