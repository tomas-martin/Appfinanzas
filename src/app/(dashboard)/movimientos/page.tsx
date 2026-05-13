"use client";

import { useEffect, useState } from "react";
import { Trash2, X, Search, ChevronLeft, Plus } from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon } from "@/lib/utils";
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

  useEffect(() => { fetchMovimientos(); }, []);

  async function fetchMovimientos() {
    try {
      const res = await fetch("/api/movimientos", { cache: "no-store" });
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
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile fade-up">
      <div className="flex items-center justify-between mt-4 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3.5 rounded-full bg-[#111111] border border-white/5 text-white active:scale-90 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tighter">Actividad</h1>
        </div>
        <Link href="/nuevo" className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-90 transition-all">
          <Plus className="w-6 h-6 stroke-[3px]" />
        </Link>
      </div>

      <div className="space-y-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="input-premium pl-12" />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(["todos", "ingreso", "gasto"] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-6 py-2 rounded-full text-[10px] font-bold transition-all uppercase tracking-widest border ${
                filtro === f ? "bg-white border-white text-black" : "bg-[#111111] border-white/5 text-muted"
              }`}>
              {f === "todos" ? "Todo" : f === "ingreso" ? "Ingresos" : "Gastos"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((mov) => (
            <div key={mov._id} onClick={() => editId !== mov._id && setEditId(mov._id)}
              className={`premium-card transition-all ${editId === mov._id ? "bg-[#151515] p-6" : "p-4 active:scale-95"}`}>
              {editId === mov._id ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted">Editar</span>
                    <button onClick={(e) => { e.stopPropagation(); setEditId(null); }} className="p-1"><X className="w-4 h-4 text-muted" /></button>
                  </div>
                  <input autoFocus type="text" value={editData.descripcion ?? mov.descripcion} onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                    className="input-premium py-2 text-sm" />
                  <input type="number" value={editData.monto ?? mov.monto} onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                    className="input-premium py-2 text-sm" />
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(mov._id); }} className="flex-1 btn-premium py-2 text-[10px]">Guardar</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(mov._id); }} className="p-3 bg-danger/10 text-danger rounded-xl"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">{getCategoryIcon(mov.categoria)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-sm text-white/90">{mov.descripcion}</p>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-0.5">{formatDateShort(mov.fecha)} · {mov.categoria}</p>
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
