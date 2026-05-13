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
    descripcion: string;
    categoria: string;
    fecha: string;
  }>;
  proximosVencimientos: Array<{
    _id: string;
    nombre: string;
    monto: number;
    moneda: string;
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
              .reduce((sum: number, m: { monto: number }) => sum + m.monto, 0)
          : 0;

        const gastos = Array.isArray(movimientos)
          ? movimientos
              .filter((m: { tipo: string }) => m.tipo === "gasto")
              .reduce((sum: number, m: { monto: number }) => sum + m.monto, 0)
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
                c: { cantidadCuotas: number; cuotasPagadas: number; montoPorCuota: number }
              ) => sum + (c.cantidadCuotas - c.cuotasPagadas) * c.montoPorCuota,
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
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted text-sm">Hola,</p>
          <h1 className="text-xl font-bold">{firstName} 👋</h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          id="logout-btn"
          className="p-2 rounded-xl bg-surface-light/50 text-muted hover:text-danger transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-5 mb-4 glow-pulse">
        <p className="text-muted text-xs uppercase tracking-wider mb-1">
          Balance del mes
        </p>
        <p
          className={`text-3xl font-bold mb-4 ${
            data.balance >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {formatMoney(data.balance)}
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted">Ingresos</p>
              <p className="text-sm font-semibold text-success">
                {formatMoney(data.ingresos)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-danger" />
            </div>
            <div>
              <p className="text-[10px] text-muted">Gastos</p>
              <p className="text-sm font-semibold text-danger">
                {formatMoney(data.gastos)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/tarjetas" className="glass-card p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted">Cuotas pendientes</span>
          </div>
          <p className="text-lg font-bold text-warning">
            {formatMoney(data.cuotasPendientes)}
          </p>
        </Link>
        <Link href="/gastos-fijos" className="glass-card p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="w-4 h-4 text-info" />
            <span className="text-xs text-muted">Próx. vencimientos</span>
          </div>
          <p className="text-lg font-bold text-info">
            {data.proximosVencimientos.length}
          </p>
        </Link>
      </div>

      {/* Last Movements */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Últimos movimientos</h2>
          <Link
            href="/movimientos"
            className="text-xs text-primary flex items-center gap-0.5"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {data.ultimosMovimientos.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted text-sm">No hay movimientos aún</p>
            <Link
              href="/nuevo"
              className="text-primary text-sm mt-2 inline-block"
            >
              Registrar el primero →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {data.ultimosMovimientos.map((mov) => (
              <div
                key={mov._id}
                className="glass-card p-3.5 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-lg">
                  {getCategoryIcon(mov.categoria)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {mov.descripcion}
                  </p>
                  <p className="text-[10px] text-muted">
                    {formatDateShort(mov.fecha)} · {mov.categoria}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    mov.tipo === "ingreso" ? "text-success" : "text-danger"
                  }`}
                >
                  {mov.tipo === "ingreso" ? "+" : "-"}
                  {formatMoney(mov.monto, mov.moneda as "ARS" | "USD")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming fixed expenses */}
      {data.proximosVencimientos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3">Próximos vencimientos</h2>
          <div className="space-y-2">
            {data.proximosVencimientos.map((gasto) => (
              <div
                key={gasto._id}
                className="glass-card p-3.5 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{gasto.nombre}</p>
                  <p className="text-[10px] text-muted">
                    Vence el día {gasto.diaVencimiento}
                  </p>
                </div>
                <p className="text-sm font-semibold text-danger">
                  {formatMoney(gasto.monto, gasto.moneda as "ARS" | "USD")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
