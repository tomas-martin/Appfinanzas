"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  CalendarClock, 
  LogOut,
  Plus
} from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  balance: number;
  ingresos: number;
  gastos: number;
  cuotasPendientes: number;
  proximosVencimientos: any[];
  ultimosMovimientos: any[];
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/movimientos/dashboard", { cache: "no-store" });
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="container-mobile pt-safe-forced pb-safe-forced fade-up">
      {/* Header - Simple & Centered */}
      <div className="flex flex-col items-center text-center mb-16">
        {session?.user?.image && (
          <img 
            src={session.user.image} 
            alt={firstName} 
            className="w-16 h-16 rounded-full mb-6 border border-white/10"
          />
        )}
        <h1 className="text-sm font-medium text-muted uppercase tracking-[0.2em] mb-1">
          Buenas tardes, {firstName}
        </h1>
      </div>

      {/* Main Balance - Huge & Apple Style */}
      <div className="flex flex-col items-center text-center mb-20">
        <div className="text-6xl font-extrabold tracking-tighter mb-4">
          {formatMoney(data.balance)}
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
            <ArrowUpRight className="w-3 h-3" /> {formatMoney(data.ingresos)}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/10 text-danger text-[10px] font-bold uppercase tracking-wider">
            <ArrowDownRight className="w-3 h-3" /> {formatMoney(data.gastos)}
          </div>
        </div>
      </div>

      {/* Action Cards - Clean & Large */}
      <div className="grid grid-cols-2 gap-4 mb-16">
        <Link href="/tarjetas" className="premium-card p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Tarjetas</p>
          <p className="text-xl font-bold">{formatMoney(data.cuotasPendientes)}</p>
        </Link>
        <Link href="/gastos-fijos" className="premium-card p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <CalendarClock className="w-6 h-6 text-white" />
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Fijos</p>
          <p className="text-xl font-bold">{data.proximosVencimientos.length} <span className="text-xs text-muted font-medium">pagos</span></p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted">Movimientos</h2>
          <Link href="/movimientos" className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ver todo</Link>
        </div>

        <div className="space-y-3">
          {data.ultimosMovimientos.map((mov: any) => (
            <div key={mov._id} className="premium-card p-6 flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shrink-0">
                {getCategoryIcon(mov.categoria)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-white/90">{mov.descripcion}</p>
                <p className="text-[9px] font-bold text-muted uppercase tracking-wider mt-1">{mov.categoria} · {formatDateShort(mov.fecha)}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold tracking-tight ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                  {mov.tipo === "ingreso" ? "+" : ""}{formatMoney(mov.monto, mov.moneda)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout - Very subtle */}
      <button 
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-20 w-full text-[9px] font-bold uppercase tracking-[0.4em] text-muted/30 py-8 hover:text-danger transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
