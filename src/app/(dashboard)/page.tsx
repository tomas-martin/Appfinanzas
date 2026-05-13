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
    <div className="container-mobile fade-in-up">
      {/* Header - More compact */}
      <div className="flex flex-col items-center text-center mb-12">
        {session?.user?.image && (
          <img src={session.user.image} alt={firstName} className="w-14 h-14 rounded-full mb-4 border border-white/10" />
        )}
        <h1 className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Hola, {firstName}</h1>
      </div>

      {/* Balance - Elegant & Centered */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="text-5xl font-extrabold tracking-tighter mb-6">{formatMoney(data.balance)}</div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest">
            <ArrowUpRight className="w-3.5 h-3.5" /> {formatMoney(data.ingresos)}
          </div>
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-danger/10 text-danger text-[10px] font-bold uppercase tracking-widest">
            <ArrowDownRight className="w-3.5 h-3.5" /> {formatMoney(data.gastos)}
          </div>
        </div>
      </div>

      {/* Action Cards - Compact Grid */}
      <div className="grid grid-cols-2 gap-4 mb-16">
        <Link href="/tarjetas" className="premium-card p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4"><CreditCard className="w-6 h-6 text-white" /></div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Tarjetas</p>
          <p className="text-xl font-bold">{formatMoney(data.cuotasPendientes)}</p>
        </Link>
        <Link href="/gastos-fijos" className="premium-card p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4"><CalendarClock className="w-6 h-6 text-white" /></div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Fijos</p>
          <p className="text-xl font-bold">{data.proximosVencimientos.length} pagos</p>
        </Link>
      </div>

      {/* Activity - Cleaner list */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Actividad</h2>
          <Link href="/movimientos" className="text-[10px] font-bold uppercase tracking-widest text-white/30">Ver todo</Link>
        </div>
        <div className="space-y-3">
          {data.ultimosMovimientos.map((mov: any) => (
            <div key={mov._id} className="premium-card p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shrink-0">{getCategoryIcon(mov.categoria)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-white/90">{mov.descripcion}</p>
                <p className="text-[9px] font-bold text-muted uppercase tracking-wider mt-1">{mov.categoria}</p>
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

      <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full text-[9px] font-bold uppercase tracking-[0.4em] text-muted/20 py-8">Desconectar</button>
    </div>
  );
}
