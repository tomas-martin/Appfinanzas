"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  CalendarClock,
  LogOut
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
    <div className="container-mobile fade-in-up">
      {/* Header - More centered and lower */}
      <div className="flex flex-col items-center text-center mb-24">
        {session?.user?.image && (
          <img 
            src={session.user.image} 
            alt={firstName} 
            className="w-20 h-20 rounded-full mb-8 border-2 border-white/5"
          />
        )}
        <h1 className="text-xs font-bold text-muted uppercase tracking-[0.4em] mb-2">
          Hola, {firstName}
        </h1>
      </div>

      {/* Main Balance - Even Huger */}
      <div className="flex flex-col items-center text-center mb-24">
        <div className="text-7xl font-extrabold tracking-tighter mb-8">
          {formatMoney(data.balance)}
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-success/10 text-success text-[11px] font-bold uppercase tracking-widest">
            <ArrowUpRight className="w-4 h-4" /> {formatMoney(data.ingresos)}
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-danger/10 text-danger text-[11px] font-bold uppercase tracking-widest">
            <ArrowDownRight className="w-4 h-4" /> {formatMoney(data.gastos)}
          </div>
        </div>
      </div>

      {/* Action Cards - Larger */}
      <div className="grid grid-cols-2 gap-6 mb-24">
        <Link href="/tarjetas" className="premium-card p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-[1.8rem] bg-white/5 flex items-center justify-center mb-6">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Tarjetas</p>
          <p className="text-2xl font-bold">{formatMoney(data.cuotasPendientes)}</p>
        </Link>
        <Link href="/gastos-fijos" className="premium-card p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-[1.8rem] bg-white/5 flex items-center justify-center mb-6">
            <CalendarClock className="w-8 h-8 text-white" />
          </div>
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Fijos</p>
          <p className="text-2xl font-bold">{data.proximosVencimientos.length} <span className="text-xs text-muted font-medium">pagos</span></p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="mb-24">
        <div className="flex items-center justify-between mb-10 px-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">Últimos Movimientos</h2>
          <Link href="/movimientos" className="text-[11px] font-bold uppercase tracking-widest text-white/40">Ver todo</Link>
        </div>

        <div className="space-y-6">
          {data.ultimosMovimientos.map((mov: any) => (
            <div key={mov._id} className="premium-card p-8 flex items-center gap-8">
              <div className="w-14 h-14 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-3xl shrink-0">
                {getCategoryIcon(mov.categoria)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold truncate text-white/90">{mov.descripcion}</p>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1.5">{mov.categoria}</p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold tracking-tight ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                  {mov.tipo === "ingreso" ? "+" : ""}{formatMoney(mov.monto, mov.moneda)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full text-[10px] font-bold uppercase tracking-[0.6em] text-muted/30 py-12 hover:text-danger transition-colors"
      >
        Desconectar
      </button>
    </div>
  );
}
