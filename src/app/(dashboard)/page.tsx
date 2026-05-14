"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  CalendarClock,
  X,
  Trash2,
  LogOut,
  ChevronLeft,
  Target,
} from "lucide-react";
import { formatMoney, getCategoryIcon, getMonthName, formatDateShort } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  balance: number;
  ingresos: number;
  gastos: number;
  cuotasPendientes: number;
  proximosVencimientos: any[];
  ultimosMovimientos: any[];
  metasCount?: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [mes, setMes] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => { fetchDashboardData(); }, [mes, anio]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/movimientos/dashboard?mes=${mes}&anio=${anio}`, { cache: "no-store" });
      setData(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    await fetch(`/api/movimientos/${id}`, { method: "DELETE" });
    setEditId(null);
    fetchDashboardData();
  }

  async function handleEdit(id: string) {
    await fetch(`/api/movimientos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditId(null);
    fetchDashboardData();
  }

  const changeMonth = (delta: number) => {
    let newMes = mes + delta;
    let newAnio = anio;
    if (newMes < 0) { newMes = 11; newAnio--; }
    if (newMes > 11) { newMes = 0; newAnio++; }
    setMes(newMes);
    setAnio(newAnio);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="container-mobile fade-up pt-6 pb-32">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {session?.user?.image && (
            <div className="relative">
              <img
                src={session.user.image}
                alt={firstName}
                className="w-9 h-9 rounded-full border border-white/10"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[--color-success] rounded-full border-2 border-[--color-background]" />
            </div>
          )}
          <div>
            <p className="text-xs text-[--color-muted] font-medium">Hola,</p>
            <p className="text-sm font-bold leading-tight">{firstName}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-9 h-9 rounded-full bg-[--color-surface] border border-[--color-border] flex items-center justify-center text-[--color-muted] active:scale-90 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Month selector ────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button
          onClick={() => changeMonth(-1)}
          className="w-8 h-8 rounded-full bg-[--color-surface] border border-[--color-border] flex items-center justify-center active:scale-90 transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-[--color-muted]" />
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-[--color-muted]">
          {getMonthName(mes)} {anio}
        </p>
        <button
          onClick={() => changeMonth(1)}
          className="w-8 h-8 rounded-full bg-[--color-surface] border border-[--color-border] flex items-center justify-center active:scale-90 transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-[--color-muted] rotate-180" />
        </button>
      </div>

      {/* ── Balance Hero ──────────────────────────────────── */}
      <div className="text-center mb-8 px-4">
        <p className="text-xs font-semibold text-[--color-muted] mb-2 uppercase tracking-wider">Balance total</p>
        <h1
          className={`text-5xl font-bold tracking-tight mb-4 transition-all duration-300 ${loading ? "opacity-30 blur-sm" : "opacity-100"
            }`}
        >
          {formatMoney(data?.balance || 0)}
        </h1>
        <div className="flex items-center justify-center gap-2">
          <span className="stat-pill bg-[--color-success-dim] text-[--color-success]">
            <ArrowUpRight className="w-3 h-3" />
            {formatMoney(data?.ingresos || 0)}
          </span>
          <span className="stat-pill bg-[--color-danger-dim] text-[--color-danger]">
            <ArrowDownRight className="w-3 h-3" />
            {formatMoney(data?.gastos || 0)}
          </span>
        </div>
      </div>

      {/* ── Quick stats ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Link href="/tarjetas" className="card flex flex-col gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-[--color-primary-dim] flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-[--color-primary]" />
          </div>
          <div>
            <p className="section-label mb-1">Tarjetas</p>
            <p className="text-lg font-bold">{formatMoney(data?.cuotasPendientes || 0)}</p>
          </div>
        </Link>

        <Link href="/gastos-fijos" className="card flex flex-col gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-[--color-primary-dim] flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-[--color-primary]" />
          </div>
          <div>
            <p className="section-label mb-1">Fijos</p>
            <p className="text-lg font-bold">{data?.proximosVencimientos.length || 0} pagos</p>
          </div>
        </Link>
      </div>

      <Link href="/metas" className="card flex items-center gap-4 mb-8 group">
        <div className="w-8 h-8 rounded-xl bg-[--color-primary-dim] flex items-center justify-center">
          <Target className="w-4 h-4 text-[--color-primary]" />
        </div>
        <div>
          <p className="section-label mb-0.5">Metas de ahorro</p>
          <p className="text-base font-bold">{data?.metasCount || 0} activas</p>
        </div>
        <ChevronLeft className="w-4 h-4 text-[--color-muted] rotate-180 ml-auto" />
      </Link>

      {/* ── Recent movements ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="section-label">Movimientos de {getMonthName(mes)}</p>
          <Link href="/movimientos" className="text-xs font-semibold text-[--color-primary]">Ver todo</Link>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
          ) : !data?.ultimosMovimientos.length ? (
            <div className="card text-center py-10">
              <p className="section-label">Sin actividad este mes</p>
            </div>
          ) : (
            data.ultimosMovimientos.map((mov: any) => (
              <div
                key={mov._id}
                onClick={() => editId !== mov._id && setEditId(mov._id)}
                className={`card transition-all cursor-pointer ${editId === mov._id ? "bg-[--color-surface-2] ring-1 ring-[--color-primary]/20" : ""
                  }`}
              >
                {editId === mov._id ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="section-label text-[--color-primary]">Editar</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditId(null); }}
                        className="p-1"
                      >
                        <X className="w-4 h-4 text-[--color-muted]" />
                      </button>
                    </div>
                    <input
                      autoFocus
                      type="text"
                      value={editData.descripcion ?? mov.descripcion}
                      onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                      className="input-premium"
                    />
                    <input
                      type="number"
                      value={editData.monto ?? mov.monto}
                      onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                      className="input-premium"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(mov._id); }}
                        className="btn-primary py-3 text-sm"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(mov._id); }}
                        className="px-4 py-3 bg-[--color-danger-dim] text-[--color-danger] rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[--color-surface-2] flex items-center justify-center text-lg shrink-0">
                      {getCategoryIcon(mov.categoria)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{mov.descripcion}</p>
                      <p className="text-xs text-[--color-muted] mt-0.5">
                        {formatDateShort(mov.fecha)} · {mov.categoria}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${mov.tipo === "ingreso" ? "text-[--color-success]" : "text-[--color-foreground]"
                        }`}>
                        {mov.tipo === "ingreso" ? "+" : "−"}{formatMoney(mov.monto)}
                      </p>
                      <p className="text-[10px] text-[--color-muted] mt-0.5 font-mono">{mov.moneda}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}