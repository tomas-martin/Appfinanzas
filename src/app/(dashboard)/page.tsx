"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarClock,
  LogOut,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  ingresos: number;
  gastos: number;
  balance: number;
  ultimosMovimientos: Array<{
    _id: string;
    tipo: string;
    monto: number;
    moneda: string;
    montoARS?: number;
    descripcion: string;
    categoria: string;
    fecha: string;
  }>;
  proximosVencimientos: Array<{
    _id: string;
    nombre: string;
    monto: number;
    moneda: string;
    montoARS?: number;
    diaVencimiento: number;
  }>;
  cuotasPendientes: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData>({
    ingresos: 0,
    gastos: 0,
    balance: 0,
    ultimosMovimientos: [],
    proximosVencimientos: [],
    cuotasPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const now = new Date();
        const mes = now.getMonth();
        const anio = now.getFullYear();

        const [movRes, fijosRes, comprasRes] = await Promise.all([
          fetch(`/api/movimientos?mes=${mes}&anio=${anio}`),
          fetch("/api/gastos-fijos"),
          fetch("/api/compras"),
        ]);

        const movimientos = await movRes.json();
        const gastosFijos = await fijosRes.json();
        const compras = await comprasRes.json();

        const ingresos = Array.isArray(movimientos)
          ? movimientos
              .filter((m: { tipo: string }) => m.tipo === "ingreso")
              .reduce((sum: number, m: { montoARS?: number; monto: number }) => sum + (m.montoARS || m.monto), 0)
          : 0;

        const gastos = Array.isArray(movimientos)
          ? movimientos
              .filter((m: { tipo: string }) => m.tipo === "gasto")
              .reduce((sum: number, m: { montoARS?: number; monto: number }) => sum + (m.montoARS || m.monto), 0)
          : 0;

        const diaActual = now.getDate();
        const proximosVencimientos = Array.isArray(gastosFijos)
          ? gastosFijos
              .filter(
                (g: { activo: boolean; diaVencimiento: number }) =>
                  g.activo && g.diaVencimiento >= diaActual
              )
              .slice(0, 3)
          : [];

        const cuotasPendientes = Array.isArray(compras)
          ? compras.reduce(
              (
                sum: number,
                c: { cantidadCuotas: number; cuotasPagadas: number; montoPorCuota: number; tipoCambio?: number }
              ) => sum + (c.cantidadCuotas - c.cuotasPagadas) * (c.montoPorCuota * (c.tipoCambio || 1)),
              0
            )
          : 0;

        setData({
          ingresos,
          gastos,
          balance: ingresos - gastos,
          ultimosMovimientos: Array.isArray(movimientos)
            ? movimientos.slice(0, 5)
            : [],
          proximosVencimientos,
          cuotasPendientes,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] || "Usuario";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-10 pb-36 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
            {firstName[0]}
          </div>
          <div>
            <p className="text-muted/60 text-[10px] font-black tracking-[0.2em] uppercase">Hola, de nuevo</p>
            <h1 className="text-2xl font-black tracking-tight">{firstName}</h1>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          id="logout-btn"
          className="p-3 rounded-2xl bg-surface-light/30 border border-white/5 text-muted hover:text-danger hover:bg-danger/10 transition-all active:scale-90"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-8 mb-8 relative overflow-hidden group border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-info/10 rounded-full blur-[60px] -ml-20 -mb-20" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted/70 text-[10px] font-black uppercase tracking-[0.3em]">
              Balance Disponible
            </p>
            <Wallet className="w-4 h-4 text-muted/30" />
          </div>
          <p
            className={`text-5xl font-black mb-10 tracking-tighter ${
              data.balance >= 0 ? "text-foreground" : "text-danger"
            }`}
          >
            {formatMoney(data.balance)}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 p-4 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-success/20">
                  <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                </div>
                <p className="text-[9px] font-black text-success/70 uppercase tracking-widest">Ingresos</p>
              </div>
              <p className="text-lg font-black text-success tracking-tight">
                {formatMoney(data.ingresos)}
              </p>
            </div>
            
            <div className="flex flex-col gap-1 p-4 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-danger/20">
                  <ArrowDownRight className="w-3.5 h-3.5 text-danger" />
                </div>
                <p className="text-[9px] font-black text-danger/70 uppercase tracking-widest">Gastos</p>
              </div>
              <p className="text-lg font-black text-danger tracking-tight">
                {formatMoney(data.gastos)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link href="/tarjetas" className="glass-card p-5 active:scale-[0.96] transition-all bg-white/[0.02] border-white/5 hover:border-warning/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-warning/10 text-warning">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-muted/80 uppercase tracking-widest">Tarjetas</span>
          </div>
          <p className="text-2xl font-black text-warning tracking-tighter">
            {formatMoney(data.cuotasPendientes)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1 h-1 rounded-full bg-warning/40 animate-pulse" />
            <p className="text-[9px] text-muted/50 font-bold uppercase tracking-widest">Deuda proyectada</p>
          </div>
        </Link>
        
        <Link href="/gastos-fijos" className="glass-card p-5 active:scale-[0.96] transition-all bg-white/[0.02] border-white/5 hover:border-info/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-info/10 text-info">
              <CalendarClock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-muted/80 uppercase tracking-widest">Fijos</span>
          </div>
          <p className="text-2xl font-black text-info tracking-tighter">
            {data.proximosVencimientos.length} <span className="text-xs font-medium text-muted/40 font-sans">vence</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1 h-1 rounded-full bg-info/40 animate-pulse" />
            <p className="text-[9px] text-muted/50 font-bold uppercase tracking-widest">En los próximos días</p>
          </div>
        </Link>
      </div>

      {/* Last Movements */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-black tracking-tight">Recientes</h2>
          <Link
            href="/movimientos"
            className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-all"
          >
            Ver Todo
          </Link>
        </div>

        {data.ultimosMovimientos.length === 0 ? (
          <div className="glass-card p-12 text-center border-dashed border-white/10 bg-transparent">
            <div className="w-20 h-20 bg-surface-light/30 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <TrendingUp className="w-10 h-10 text-muted/10" />
            </div>
            <p className="text-muted/60 text-sm font-bold">No hay movimientos este mes</p>
            <Link
              href="/nuevo"
              className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-4 inline-block hover:underline"
            >
              Crear el primero →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.ultimosMovimientos.map((mov) => (
              <div
                key={mov._id}
                className="glass-card p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-all cursor-pointer group border-white/5 active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-light/50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {getCategoryIcon(mov.categoria)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black truncate tracking-tight">
                    {mov.descripcion}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-bold text-muted/40 uppercase tracking-widest">
                      {formatDateShort(mov.fecha)}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-muted/20" />
                    <p className="text-[10px] font-black text-muted/60 uppercase tracking-widest">
                      {mov.categoria}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-black tracking-tighter ${
                      mov.tipo === "ingreso" ? "text-success" : "text-foreground"
                    }`}
                  >
                    {mov.tipo === "ingreso" ? "+" : ""}
                    {formatMoney(mov.monto, mov.moneda as "ARS" | "USD")}
                  </p>
                  {mov.moneda === "USD" && mov.montoARS && (
                    <p className="text-[10px] font-bold text-muted/30 mt-0.5">
                      ≈ {formatMoney(mov.montoARS)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming fixed expenses */}
      {data.proximosVencimientos.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-black tracking-tight mb-6 px-1">Próximos pagos</h2>
          <div className="space-y-4">
            {data.proximosVencimientos.map((gasto) => (
              <div
                key={gasto._id}
                className="glass-card p-5 flex items-center justify-between border-l-[6px] border-l-info bg-info/[0.03] hover:bg-info/[0.06] transition-all"
              >
                <div>
                  <p className="text-base font-black tracking-tight">{gasto.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarClock className="w-3.5 h-3.5 text-info/50" />
                    <p className="text-[10px] font-black text-info/60 uppercase tracking-widest">
                      Día {gasto.diaVencimiento}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-foreground tracking-tighter">
                    {formatMoney(gasto.monto, gasto.moneda as "ARS" | "USD")}
                  </p>
                  {gasto.moneda === "USD" && gasto.montoARS && (
                    <p className="text-[10px] font-bold text-muted/30 mt-0.5">
                      ≈ {formatMoney(gasto.montoARS)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
