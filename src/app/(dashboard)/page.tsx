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
    <div className="container-mobile pt-10 pb-32 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 px-1">
        <div>
          <p className="text-muted/60 text-sm font-medium tracking-wide uppercase mb-0.5">Bienvenido de nuevo</p>
          <h1 className="text-3xl font-black tracking-tight">{firstName} 👋</h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          id="logout-btn"
          className="p-3.5 rounded-2xl bg-surface-light/30 border border-white/5 text-muted hover:text-danger hover:bg-danger/10 transition-all shadow-xl active:scale-90"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-8 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/20" />
        
        <div className="relative z-10">
          <p className="text-muted/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">
            Balance Total (ARS)
          </p>
          <p
            className={`text-4xl font-black mb-8 tracking-tighter ${
              data.balance >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatMoney(data.balance)}
          </p>
          
          <div className="flex gap-6">
            <div className="flex flex-col gap-1.5 flex-1 p-4 rounded-2xl bg-success/5 border border-success/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-success/20">
                  <ArrowUpRight className="w-4 h-4 text-success" />
                </div>
                <p className="text-[10px] font-bold text-success/70 uppercase tracking-wider">Ingresos</p>
              </div>
              <p className="text-lg font-black text-success">
                {formatMoney(data.ingresos)}
              </p>
            </div>
            
            <div className="flex flex-col gap-1.5 flex-1 p-4 rounded-2xl bg-danger/5 border border-danger/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-danger/20">
                  <ArrowDownRight className="w-4 h-4 text-danger" />
                </div>
                <p className="text-[10px] font-bold text-danger/70 uppercase tracking-wider">Gastos</p>
              </div>
              <p className="text-lg font-black text-danger">
                {formatMoney(data.gastos)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link href="/tarjetas" className="glass-card p-5 active:scale-[0.96] transition-all hover:bg-surface-light/40 border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-warning/10">
              <Wallet className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs font-bold text-muted/80 uppercase tracking-wider">Tarjetas</span>
          </div>
          <p className="text-xl font-black text-warning tracking-tight">
            {formatMoney(data.cuotasPendientes)}
          </p>
          <p className="text-[10px] text-muted/50 mt-1 font-medium italic">Deuda total estimada</p>
        </Link>
        
        <Link href="/gastos-fijos" className="glass-card p-5 active:scale-[0.96] transition-all hover:bg-surface-light/40 border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-info/10">
              <CalendarClock className="w-5 h-5 text-info" />
            </div>
            <span className="text-xs font-bold text-muted/80 uppercase tracking-wider">Fijos</span>
          </div>
          <p className="text-xl font-black text-info tracking-tight">
            {data.proximosVencimientos.length} <span className="text-xs font-medium text-muted/60">por vencer</span>
          </p>
          <p className="text-[10px] text-muted/50 mt-1 font-medium italic">Este mes</p>
        </Link>
      </div>

      {/* Last Movements */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            Últimos movimientos
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">Recientes</span>
          </h2>
          <Link
            href="/movimientos"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
          >
            Ver historial <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {data.ultimosMovimientos.length === 0 ? (
          <div className="glass-card p-12 text-center border-dashed border-white/10 bg-transparent">
            <div className="w-16 h-16 bg-surface-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-muted/20" />
            </div>
            <p className="text-muted text-sm font-medium">No hay movimientos registrados</p>
            <Link
              href="/nuevo"
              className="btn-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold mt-4 inline-block shadow-lg"
            >
              Empieza ahora
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.ultimosMovimientos.map((mov) => (
              <div
                key={mov._id}
                className="glass-card p-4 flex items-center gap-4 hover:bg-surface-light/30 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-surface-light flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  {getCategoryIcon(mov.categoria)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate tracking-tight">
                    {mov.descripcion}
                  </p>
                  <p className="text-[11px] font-medium text-muted/60 uppercase tracking-wider mt-0.5">
                    {formatDateShort(mov.fecha)} · {mov.categoria}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-base font-black tracking-tight ${
                      mov.tipo === "ingreso" ? "text-success" : "text-danger"
                    }`}
                  >
                    {mov.tipo === "ingreso" ? "+" : "-"}
                    {formatMoney(mov.monto, mov.moneda as "ARS" | "USD")}
                  </p>
                  {mov.moneda === "USD" && mov.montoARS && (
                    <p className="text-[10px] font-bold text-muted/40 mt-0.5">
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
          <h2 className="text-lg font-black tracking-tight mb-5 px-1">Próximos vencimientos</h2>
          <div className="space-y-3">
            {data.proximosVencimientos.map((gasto) => (
              <div
                key={gasto._id}
                className="glass-card p-5 flex items-center justify-between border-l-4 border-l-info bg-info/5"
              >
                <div>
                  <p className="text-sm font-black tracking-tight">{gasto.nombre}</p>
                  <p className="text-[11px] font-bold text-info/70 uppercase tracking-widest mt-1">
                    Vence el día {gasto.diaVencimiento}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-info tracking-tight">
                    {formatMoney(gasto.monto, gasto.moneda as "ARS" | "USD")}
                  </p>
                  {gasto.moneda === "USD" && gasto.montoARS && (
                    <p className="text-[10px] font-bold text-muted/40 mt-0.5">
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
