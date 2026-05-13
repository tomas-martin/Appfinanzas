"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  CalendarClock
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

  useEffect(() => { fetchDashboardData(); }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/movimientos/dashboard", { cache: "no-store" });
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
    <div className="container-mobile fade-up">
      {/* Centered Header */}
      <div className="flex flex-col items-center text-center mt-8 mb-12">
        {session?.user?.image && (
          <img src={session.user.image} alt={firstName} className="w-14 h-14 rounded-full mb-4 border border-white/10" />
        )}
        <h1 className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Capital Total</h1>
      </div>

      {/* Responsive Balance */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="text-balance mb-6">{formatMoney(data.balance)}</div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest">
            <ArrowUpRight className="w-3.5 h-3.5" /> {formatMoney(data.ingresos)}
          </div>
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-danger/10 text-danger text-[10px] font-bold uppercase tracking-widest">
            <ArrowDownRight className="w-3.5 h-3.5" /> {formatMoney(data.gastos)}
          </div>
        </div>
      </div>

      {/* Action Cards - Flexible Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        <Link href="/tarjetas" className="premium-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4"><CreditCard className="w-5 h-5 text-white" /></div>
          <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Tarjetas</p>
          <p className="text-lg font-bold">{formatMoney(data.cuotasPendientes)}</p>
        </Link>
        <Link href="/gastos-fijos" className="premium-card flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4"><CalendarClock className="w-5 h-5 text-white" /></div>
          <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Fijos</p>
          <p className="text-lg font-bold">{data.proximosVencimientos.length} pagos</p>
        </Link>
      </div>

      {/* Recent Activity List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Movimientos</h2>
          <Link href="/movimientos" className="text-[10px] font-bold uppercase tracking-widest text-white/30">Ver todo</Link>
        </div>
        <div className="space-y-3">
          {data.ultimosMovimientos.map((mov: any) => (
            <div key={mov._id} className="premium-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">{getCategoryIcon(mov.categoria)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-sm text-white/90">{mov.descripcion}</p>
                <p className="text-[9px] font-bold text-muted uppercase tracking-wider mt-0.5">{mov.categoria}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm tracking-tight ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                  {mov.tipo === "ingreso" ? "+" : ""}{formatMoney(mov.monto, mov.moneda)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full text-[8px] font-bold uppercase tracking-[0.6em] text-muted/20 py-8">Desconectar</button>
    </div>
  );
}
