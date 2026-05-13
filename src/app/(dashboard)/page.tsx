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
  Calendar
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
      const dashboardData = await res.json();
      setData(dashboardData);
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
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="container-mobile fade-up">
      {/* Header with Logout */}
      <div className="flex items-center justify-between mt-4 mb-6 px-1">
        <div className="w-10" />
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {session?.user?.image && (
              <img src={session.user.image} alt={firstName} className="w-12 h-12 rounded-full mb-3 border-2 border-primary/20 p-0.5" />
            )}
            <div className="absolute bottom-2.5 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-black" />
          </div>
          <h1 className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Hola, <span className="text-white">{firstName}</span></h1>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-muted hover:text-white active:scale-90 transition-all"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Month Selector Dashboard */}
      <div className="flex items-center justify-center gap-7 mb-8 bg-[#0D0D0D] py-3.5 rounded-[2rem] border border-white/5 mx-2 shadow-xl">
        <button onClick={() => changeMonth(-1)} className="p-2.5 rounded-full hover:bg-white/5 active:scale-75 transition-all text-muted">
          <ChevronLeft className="w-5.5 h-5.5" />
        </button>
        <div className="flex items-center gap-3">
          <Calendar className="w-3.5 h-3.5 text-primary opacity-50" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
            {getMonthName(mes)} {anio}
          </span>
        </div>
        <button onClick={() => changeMonth(1)} className="p-2.5 rounded-full hover:bg-white/5 active:scale-75 transition-all text-muted">
          <ChevronLeft className="w-5.5 h-5.5 rotate-180" />
        </button>
      </div>

      <div className="flex flex-col items-center text-center mb-10">
        <div className={`text-4xl font-black mb-7 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 transition-all duration-500 tracking-tighter ${loading ? "opacity-30 scale-95" : "opacity-100 scale-100"}`}>
          {formatMoney(data?.balance || 0)}
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest border border-success/20">
            <ArrowUpRight className="w-3.5 h-3.5" /> {formatMoney(data?.ingresos || 0)}
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-danger/10 text-danger text-[10px] font-black uppercase tracking-widest border border-danger/20">
            <ArrowDownRight className="w-3.5 h-3.5" /> {formatMoney(data?.gastos || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link href="/tarjetas" className="premium-card p-5 flex flex-col items-center text-center group hover:border-primary/30">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1.5">Tarjetas</p>
          <p className="text-lg font-black text-white">{formatMoney(data?.cuotasPendientes || 0)}</p>
        </Link>
        <Link href="/gastos-fijos" className="premium-card p-5 flex flex-col items-center text-center group hover:border-primary/30">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CalendarClock className="w-5 h-5" />
          </div>
          <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1.5">Fijos</p>
          <p className="text-lg font-black text-white">{data?.proximosVencimientos.length || 0} pagos</p>
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-5 px-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Movimientos de {getMonthName(mes)}</h2>
          <Link href="/movimientos" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary">Ver todo</Link>
        </div>
        <div className="space-y-3 min-h-[100px]">
          {loading ? (
             <div className="flex justify-center py-10 opacity-20">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
             </div>
          ) : data?.ultimosMovimientos.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-white/5 rounded-3xl opacity-20">
              <p className="text-[9px] font-bold uppercase tracking-widest">Sin actividad</p>
            </div>
          ) : (
            data?.ultimosMovimientos.map((mov: any) => (
              <div key={mov._id} onClick={() => editId !== mov._id && setEditId(mov._id)}
                className={`premium-card transition-all ${editId === mov._id ? "bg-[#151515] p-6 ring-2 ring-primary/20" : "p-4.5 active:scale-[0.98]"}`}>
                {editId === mov._id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Editar rápido</span>
                      <button onClick={(e) => { e.stopPropagation(); setEditId(null); }} className="p-1.5"><X className="w-4.5 h-4.5 text-muted" /></button>
                    </div>
                    <input autoFocus type="text" value={editData.descripcion ?? mov.descripcion} onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                      className="input-premium py-2.5 text-base" />
                    <input type="number" value={editData.monto ?? mov.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                      className="input-premium py-2.5 text-base" />
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(mov._id); }} className="flex-1 btn-primary py-3 text-[10px]">Guardar</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(mov._id); }} className="p-3 bg-danger/10 text-danger rounded-xl"><Trash2 className="w-4.5 h-4.5" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4.5 p-0.5">
                    <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-lg shrink-0">{getCategoryIcon(mov.categoria)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-[14px] text-white/95">{mov.descripcion}</p>
                      <p className="text-[8px] font-bold text-muted uppercase tracking-widest mt-1 opacity-60">
                        {formatDateShort(mov.fecha)} · {mov.categoria}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-[15px] tracking-tight ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                        {mov.tipo === "ingreso" ? "+" : ""}{formatMoney(mov.monto)}
                      </p>
                      <p className="text-[8px] font-bold text-muted/30 uppercase mt-1 tracking-widest">{mov.moneda}</p>
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
