"use client";

import { useEffect, useState } from "react";
import { Trash2, X, Search, ChevronLeft, Plus, Calendar } from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon, getMonthName } from "@/lib/utils";
import { type Moneda } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Mov {
  _id: string;
  tipo: string;
  monto: number;
  moneda: Moneda;
  montoARS?: number;
  descripcion: string;
  categoria: string;
  fecha: string;
}

export default function MovimientosPage() {
  const router = useRouter();
  const [movimientos, setMovimientos] = useState<Mov[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "gasto" | "ingreso">("todos");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Mov>>({});
  const [busqueda, setBusqueda] = useState("");
  
  const [mes, setMes] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => { fetchMovimientos(); }, [mes, anio]);

  async function fetchMovimientos() {
    try {
      const res = await fetch(`/api/movimientos?mes=${mes}&anio=${anio}`, { cache: "no-store" });
      const data = await res.json();
      setMovimientos(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    await fetch(`/api/movimientos/${id}`, { method: "DELETE" });
    setMovimientos((prev) => prev.filter((m) => m._id !== id));
  }

  async function handleEdit(id: string) {
    try {
      await fetch(`/api/movimientos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      setEditId(null);
      fetchMovimientos();
    } catch (err) { console.error(err); }
  }

  const filtered = movimientos
    .filter((m) => (filtro === "todos" ? true : m.tipo === filtro))
    .filter((m) => m.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile fade-up">
      <div className="flex items-center justify-between mt-4 mb-10 px-1">
        <div className="flex items-center gap-5">
          <button onClick={() => router.back()} className="p-4 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-extrabold tracking-tighter">Actividad</h1>
        </div>
        <Link href="/nuevo" className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl active:scale-90 transition-all">
          <Plus className="w-7 h-7 stroke-[3px]" />
        </Link>
      </div>

      <div className="space-y-10">
        <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-[14px] font-black uppercase tracking-widest">{getMonthName(mes)} {anio}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setMes(mes === 0 ? 11 : mes - 1)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setMes(mes === 11 ? 0 : mes + 1)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10">
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input type="text" placeholder="Buscar movimientos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="input-premium pl-14 py-4 text-base" />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {(["todos", "ingreso", "gasto"] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-8 py-3 rounded-full text-[12px] font-black transition-all uppercase tracking-widest border ${
                filtro === f ? "bg-white border-white text-black shadow-lg" : "bg-[#111111] border-white/5 text-muted"
              }`}>
              {f === "todos" ? "Todo" : f === "ingreso" ? "Ingresos" : "Gastos"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-24 text-center border border-dashed border-white/5 rounded-[3rem]">
              <p className="text-[12px] font-bold text-muted uppercase tracking-widest">Sin movimientos este mes</p>
            </div>
          ) : (
            filtered.map((mov) => (
              <div key={mov._id} onClick={() => editId !== mov._id && setEditId(mov._id)}
                className={`premium-card transition-all ${editId === mov._id ? "bg-[#151515] p-8 ring-2 ring-primary/20" : "p-6 active:scale-95"}`}>
                {editId === mov._id ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Editar</span>
                      <button onClick={(e) => { e.stopPropagation(); setEditId(null); }} className="p-2"><X className="w-5 h-5 text-muted" /></button>
                    </div>
                    <input autoFocus type="text" value={editData.descripcion ?? mov.descripcion} onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                      className="input-premium py-4 text-base" />
                    <input type="number" value={editData.monto ?? mov.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                      className="input-premium py-4 text-base" />
                    <div className="flex gap-4">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(mov._id); }} className="flex-1 btn-primary py-4 text-[12px]">Guardar Cambios</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(mov._id); }} className="p-4 bg-danger/10 text-danger rounded-2xl"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shrink-0">{getCategoryIcon(mov.categoria)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-[17px] text-white/95 tracking-tight">{mov.descripcion}</p>
                      <p className="text-[11px] font-bold text-muted uppercase tracking-widest mt-2 opacity-60">{formatDateShort(mov.fecha)} · {mov.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-[18px] tracking-tighter ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                        {mov.tipo === "ingreso" ? "+" : ""}{formatMoney(mov.monto)}
                      </p>
                      <p className="text-[10px] font-bold text-muted/30 uppercase mt-2 tracking-widest">{mov.moneda}</p>
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
