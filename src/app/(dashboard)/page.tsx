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
  LogOut
} from "lucide-react";
import { formatMoney, getCategoryIcon } from "@/lib/utils";
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

  useEffect(() => { fetchDashboardData(); }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/movimientos/dashboard", { cache: "no-store" });
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
      {/* Header with Logout */}
      <div className="flex items-center justify-between mt-6 mb-10 px-1">
        <div className="w-10" />
        <div className="flex flex-col items-center text-center">
          {session?.user?.image && (
            <img src={session.user.image} alt={firstName} className="w-12 h-12 rounded-full mb-3 border border-white/10" />
          )}
          <h1 className="text-[9px] font-bold text-muted uppercase tracking-[0.3em]">Hola, {firstName}</h1>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-muted hover:text-white active:scale-90 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

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

      <div className="grid grid-cols-2 gap-4 mb-12">
        <Link href="/tarjetas" className="premium-card flex flex-col items-center text-center group">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Tarjetas</p>
          <p className="text-lg font-bold">{formatMoney(data.cuotasPendientes)}</p>
        </Link>
        <Link href="/gastos-fijos" className="premium-card flex flex-col items-center text-center group">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all">
            <CalendarClock className="w-5 h-5" />
          </div>
          <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Fijos</p>
          <p className="text-lg font-bold">{data.proximosVencimientos.length} pagos</p>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Movimientos</h2>
          <Link href="/movimientos" className="text-[10px] font-bold uppercase tracking-widest text-white/30">Ver todo</Link>
        </div>
        <div className="space-y-3">
          {data.ultimosMovimientos.map((mov: any) => (
            <div key={mov._id} onClick={() => editId !== mov._id && setEditId(mov._id)}
              className={`premium-card transition-all ${editId === mov._id ? "bg-[#151515] ring-1 ring-white/10" : "active:scale-95"}`}>
              {editId === mov._id ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Editar rápido</span>
                    <button onClick={(e) => { e.stopPropagation(); setEditId(null); }} className="p-1"><X className="w-4 h-4 text-muted" /></button>
                  </div>
                  <input autoFocus type="text" value={editData.descripcion ?? mov.descripcion} onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                    className="input-premium py-2 text-sm" />
                  <input type="number" value={editData.monto ?? mov.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                    className="input-premium py-2 text-sm" />
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(mov._id); }} className="flex-1 btn-premium py-2 text-[9px]">Guardar</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(mov._id); }} className="p-2 bg-danger/10 text-danger rounded-xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-1">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">{getCategoryIcon(mov.categoria)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-sm text-white/90">{mov.descripcion}</p>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-0.5">{mov.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm tracking-tight ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                      {mov.tipo === "ingreso" ? "+" : ""}{formatMoney(mov.monto)}
                    </p>
                    <p className="text-[8px] font-bold text-muted/30 uppercase mt-0.5">{mov.moneda}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
