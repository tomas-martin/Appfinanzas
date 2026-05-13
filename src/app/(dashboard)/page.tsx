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
          fetch(`/api/movimientos?mes=${mes}&anio=${anio}`, { cache: "no-store" }),
          fetch("/api/gastos-fijos", { cache: "no-store" }),
          fetch("/api/compras", { cache: "no-store" }),
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
  const userImage = session?.user?.image;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-14 pb-44 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 px-1">
        <div className="flex items-center gap-5">
          {userImage ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/25 blur-xl rounded-full group-hover:bg-primary/40 transition-all" />
              <img 
                src={userImage} 
                alt={firstName} 
                className="relative w-16 h-16 rounded-[2rem] object-cover border-2 border-white/10 shadow-2xl transition-transform group-hover:scale-105 duration-500"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-primary/20">
              {firstName[0]}
            </div>
          )}
          <div>
            <p className="text-muted/40 text-[11px] font-black tracking-[0.3em] uppercase mb-1">Bienvenido,</p>
            <h1 className="text-3xl font-black tracking-tight">{firstName}</h1>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 text-muted/40 hover:text-danger hover:bg-danger/10 transition-all active:scale-90 shadow-lg"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Balance Card - Ultra Premium Refinement */}
      <div className="glass-card p-14 mb-16 relative overflow-hidden group border-white/[0.08] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] -mr-64 -mt-64 animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/5 mb-10 backdrop-blur-3xl shadow-inner">
            <p className="text-muted/40 text-[9px] font-black uppercase tracking-[0.5em]">
              Capital Total
            </p>
          </div>
          
          <h2 className={`text-7xl font-black mb-16 tracking-tighter drop-shadow-2xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent`}>
            {formatMoney(data.balance)}
          </h2>
          
          <div className="grid grid-cols-2 gap-8 w-full">
            <div className="flex flex-col items-center gap-3 p-7 rounded-[2.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-2xl hover:bg-white/[0.03] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-success/10 text-success shadow-lg shadow-success/10">
                  <TrendingUp className="w-4 h-4 stroke-[3px]" />
                </div>
                <p className="text-[10px] font-black text-success/40 uppercase tracking-[0.2em]">Ingresos</p>
              </div>
              <p className="text-2xl font-black text-success tracking-tight">
                {formatMoney(data.ingresos)}
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 p-7 rounded-[2.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-2xl hover:bg-white/[0.03] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-danger/10 text-danger shadow-lg shadow-danger/10">
                  <TrendingDown className="w-4 h-4 stroke-[3px]" />
                </div>
                <p className="text-[10px] font-black text-danger/40 uppercase tracking-[0.2em]">Gastos</p>
              </div>
              <p className="text-2xl font-black text-danger tracking-tight">
                {formatMoney(data.gastos)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row - Increased Separation */}
      <div className="grid grid-cols-2 gap-8 mb-20">
        <Link href="/tarjetas" className="glass-card p-8 active:scale-[0.96] transition-all bg-white/[0.01] border-white/5 hover:border-warning/30 group shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-warning/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-warning/10 text-warning group-hover:scale-110 transition-transform shadow-xl shadow-warning/10">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black text-muted/40 uppercase tracking-[0.2em]">Tarjetas</span>
            </div>
            <p className="text-3xl font-black text-warning tracking-tighter mb-2">
              {formatMoney(data.cuotasPendientes)}
            </p>
            <p className="text-[10px] text-muted/20 font-black uppercase tracking-widest">Saldo a pagar</p>
          </div>
        </Link>
        
        <Link href="/gastos-fijos" className="glass-card p-8 active:scale-[0.96] transition-all bg-white/[0.01] border-white/5 hover:border-info/30 group shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-info/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-info/10 text-info group-hover:scale-110 transition-transform shadow-xl shadow-info/10">
                <CalendarClock className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black text-muted/40 uppercase tracking-[0.2em]">Fijos</span>
            </div>
            <p className="text-3xl font-black text-info tracking-tighter mb-2">
              {data.proximosVencimientos.length} <span className="text-xs font-medium text-muted/20 lowercase">pagos</span>
            </p>
            <p className="text-[10px] text-muted/20 font-black uppercase tracking-widest">Pendientes</p>
          </div>
        </Link>
      </div>


      {/* Last Movements */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-black tracking-tight">Movimientos</h2>
          <Link
            href="/movimientos"
            className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10"
          >
            Ver Todo
          </Link>
        </div>

        {data.ultimosMovimientos.length === 0 ? (
          <div className="glass-card p-16 text-center border-dashed border-white/5 bg-transparent">
            <div className="w-20 h-20 bg-surface-light/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-muted/10" />
            </div>
            <p className="text-muted/30 text-[10px] font-black uppercase tracking-widest">Sin actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.ultimosMovimientos.map((mov) => (
              <div
                key={mov._id}
                className="glass-card p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all cursor-pointer group border-white/5 active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-light/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {getCategoryIcon(mov.categoria)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-black truncate tracking-tight">
                    {mov.descripcion}
                  </p>
                  <p className="text-[9px] font-black text-muted/40 uppercase tracking-widest mt-1">
                    {formatDateShort(mov.fecha)} · {mov.categoria}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-[17px] font-black tracking-tighter ${
                      mov.tipo === "ingreso" ? "text-success" : "text-foreground"
                    }`}
                  >
                    {mov.tipo === "ingreso" ? "+" : ""}
                    {formatMoney(mov.monto, mov.moneda as "ARS" | "USD")}
                  </p>
                  {mov.moneda === "USD" && mov.montoARS && (
                    <p className="text-[9px] font-black text-muted/20 mt-0.5">
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
        <div className="mb-12">
          <h2 className="text-xl font-black tracking-tight mb-6 px-1">Próximos Pagos</h2>
          <div className="space-y-4">
            {data.proximosVencimientos.map((gasto) => (
              <div
                key={gasto._id}
                className="glass-card p-5 flex items-center justify-between bg-info/[0.02] border-white/5 hover:bg-info/[0.04] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <CalendarClock className="w-6 h-6 text-info/50" />
                  </div>
                  <div>
                    <p className="text-[15px] font-black tracking-tight">{gasto.nombre}</p>
                    <p className="text-[9px] font-black text-info/40 uppercase tracking-widest mt-1">
                      Vence el día {gasto.diaVencimiento}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[17px] font-black text-foreground tracking-tighter">
                    {formatMoney(gasto.monto, gasto.moneda as "ARS" | "USD")}
                  </p>
                  {gasto.moneda === "USD" && gasto.montoARS && (
                    <p className="text-[9px] font-black text-muted/20 mt-0.5">
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
