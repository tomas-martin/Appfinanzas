"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, X, Search, ChevronLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon } from "@/lib/utils";
import { type Moneda } from "@/types";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    fetchMovimientos();
  }, []);

  async function fetchMovimientos() {
    try {
      const res = await fetch("/api/movimientos", { cache: "no-store" });
      const data = await res.json();
      setMovimientos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = movimientos
    .filter((m) => (filtro === "todos" ? true : m.tipo === filtro))
    .filter((m) => m.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile fade-in-up">
      <div className="flex items-center gap-8 mb-20">
        <button onClick={() => router.back()} className="p-5 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-4xl font-extrabold tracking-tighter">Actividad</h1>
      </div>

      <div className="space-y-12">
        <div className="relative">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input 
            type="text" 
            placeholder="Buscar transacciones..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-huge pl-18 pr-8"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {(["todos", "ingreso", "gasto"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-10 py-4 rounded-full text-[11px] font-bold transition-all uppercase tracking-[0.2em] border ${
                filtro === f
                  ? "bg-white border-white text-black scale-105 shadow-xl"
                  : "bg-[#111111] border-white/5 text-muted"
              }`}
            >
              {f === "todos" ? "Todo" : f === "ingreso" ? "Ingresos" : "Gastos"}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filtered.map((mov) => (
            <div 
              key={mov._id} 
              onClick={() => editId !== mov._id && setEditId(mov._id)}
              className={`premium-card transition-all overflow-hidden ${editId === mov._id ? "p-10 bg-[#151515] ring-2 ring-white/10" : "p-8 active:scale-95"}`}
            >
              {editId === mov._id ? (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Editar Movimiento</h3>
                    <button onClick={(e) => { e.stopPropagation(); setEditId(null); }} className="p-2"><X className="w-6 h-6 text-muted" /></button>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-4">Descripción</label>
                    <input
                      autoFocus
                      type="text"
                      value={editData.descripcion ?? mov.descripcion}
                      onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                      className="w-full bg-black rounded-3xl px-8 py-6 text-lg font-bold border border-white/10 outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-4">Monto</label>
                    <input
                      type="number"
                      value={editData.monto ?? mov.monto}
                      onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                      className="w-full bg-black rounded-3xl px-8 py-6 text-lg font-bold border border-white/10 outline-none"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(mov._id); }} className="flex-1 btn-main py-6 text-sm">Guardar</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(mov._id); }} className="p-6 bg-danger/10 text-danger rounded-3xl active:scale-90"><Trash2 className="w-6 h-6" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-[1.8rem] bg-white/5 flex items-center justify-center text-4xl shrink-0">
                    {getCategoryIcon(mov.categoria)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold truncate text-white/95">{mov.descripcion}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{formatDateShort(mov.fecha)}</p>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{mov.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold tracking-tighter ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                      {mov.tipo === "ingreso" ? "+" : ""}{formatMoney(mov.monto, mov.moneda)}
                    </p>
                    <p className="text-[9px] font-bold text-muted/20 uppercase tracking-widest mt-1.5">Ver detalles</p>
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
