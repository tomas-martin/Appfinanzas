"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  CalendarClock, 
  LogOut,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
      <div className="flex items-center justify-center min-h-dvh bg-[#060912]">
        <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] || "Usuario";
  const userImage = session?.user?.image;

  return (
    <div className="container-mobile pt-20 pb-48 fade-in">
      {/* Header - More Elegant & Smaller */}
      <div className="flex items-center justify-between mb-16 px-2">
        <div className="flex items-center gap-5">
          {userImage ? (
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
              <img 
                src={userImage} 
                alt={firstName} 
                className="relative w-14 h-14 rounded-[1.8rem] object-cover border border-white/5 shadow-2xl"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-[1.8rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-white font-bold text-xl">
              {firstName[0]}
            </div>
          )}
          <div>
            <p className="text-muted/30 text-[9px] font-black tracking-[0.4em] uppercase mb-1">Hola,</p>
            <h1 className="text-2xl font-black tracking-tighter text-white/90">{firstName}</h1>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 text-muted/30 hover:text-danger hover:bg-danger/5 transition-all active:scale-90"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Balance Card - Refined & Less Bulky */}
      <div className="glass-card p-12 mb-20 relative overflow-hidden group border-white/[0.04] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/[0.05] rounded-full blur-[120px] -mr-56 -mt-56" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="px-5 py-1.5 rounded-full bg-white/[0.02] border border-white/5 mb-10 backdrop-blur-3xl">
            <p className="text-muted/40 text-[8px] font-black uppercase tracking-[0.5em]">
              Capital Total
            </p>
          </div>
          
          <h2 className="text-6xl font-black mb-16 tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent drop-shadow-2xl">
            {formatMoney(data.balance)}
          </h2>
          
          <div className="grid grid-cols-2 gap-10 w-full max-w-[280px]">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-success/40" />
                <p className="text-[9px] font-black text-muted/30 uppercase tracking-[0.2em]">Ingresos</p>
              </div>
              <p className="text-xl font-black text-success tracking-tight">
                {formatMoney(data.ingresos)}
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-3.5 h-3.5 text-danger/40" />
                <p className="text-[9px] font-black text-muted/30 uppercase tracking-[0.2em]">Gastos</p>
              </div>
              <p className="text-xl font-black text-danger tracking-tight">
                {formatMoney(data.gastos)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - More Spaced & Elegant */}
      <div className="grid grid-cols-2 gap-8 mb-24">
        <Link href="/tarjetas" className="glass-card p-8 active:scale-[0.96] transition-all bg-white/[0.01] border-white/5 hover:border-warning/20 group relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3.5 rounded-2xl bg-warning/5 text-warning/50 group-hover:scale-110 transition-transform shadow-xl shadow-warning/5">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-muted/30 uppercase tracking-[0.2em]">Tarjetas</span>
          </div>
          <p className="text-2xl font-black text-warning/90 tracking-tighter mb-2">
            {formatMoney(data.cuotasPendientes)}
          </p>
          <p className="text-[9px] text-muted/20 font-black uppercase tracking-[0.2em]">A pagar</p>
        </Link>
        
        <Link href="/gastos-fijos" className="glass-card p-8 active:scale-[0.96] transition-all bg-white/[0.01] border-white/5 hover:border-info/20 group relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3.5 rounded-2xl bg-info/5 text-info/50 group-hover:scale-110 transition-transform shadow-xl shadow-info/5">
              <CalendarClock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-muted/30 uppercase tracking-[0.2em]">Fijos</span>
          </div>
          <p className="text-2xl font-black text-info/90 tracking-tighter mb-2">
            {data.proximosVencimientos.length} <span className="text-xs font-medium text-muted/20 lowercase tracking-normal">pagos</span>
          </p>
          <p className="text-[9px] text-muted/20 font-black uppercase tracking-[0.2em]">Pendientes</p>
        </Link>
      </div>

      {/* Movements - More Spaced */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-10 px-2">
          <h2 className="text-lg font-black tracking-tight text-white/80">Movimientos</h2>
          <Link
            href="/movimientos"
            className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] hover:text-primary transition-colors"
          >
            Ver todo
          </Link>
        </div>

        <div className="space-y-6">
          {data.ultimosMovimientos.map((mov: any) => (
            <div key={mov._id} className="glass-card p-5 border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] transition-all active:scale-[0.98]">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.4rem] bg-white/[0.02] flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {getCategoryIcon(mov.categoria)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-black truncate text-white/90 tracking-tight">
                    {mov.descripcion}
                  </p>
                  <p className="text-[10px] font-black text-muted/20 uppercase tracking-[0.2em] mt-1.5">
                    {formatDateShort(mov.fecha)} · {mov.categoria}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-base font-black tracking-tighter ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                    {mov.tipo === "ingreso" ? "+" : ""}
                    {formatMoney(mov.monto, mov.moneda)}
                  </p>
                  {mov.moneda === "USD" && mov.montoARS && (
                    <p className="text-[9px] font-black text-muted/10 mt-1 uppercase tracking-widest">
                      ≈ {formatMoney(mov.montoARS)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Debug Section - Subtle */}
      <div className="mt-20 py-8 border-t border-white/[0.02] text-center">
        <p className="text-[8px] font-black text-muted/10 uppercase tracking-[0.5em]">
          Identified: {session?.user?.email}
        </p>
      </div>
    </div>
  );
}
