"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, Filter, X, Search, ChevronLeft } from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon } from "@/lib/utils";
import { type Moneda } from "@/types";
import Link from "next/link";
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
      <div className="flex items-center justify-center min-h-dvh bg-[#060912]">
        <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-safe pb-nav fade-in">
      <div className="flex items-center justify-between mt-12 mb-16 px-1">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-3.5 rounded-[1.2rem] bg-white/[0.02] border border-white/5 text-muted/30 hover:text-primary transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-muted/20 text-[8px] font-black uppercase tracking-[0.5em] mb-1">Actividad</p>
            <h1 className="text-2xl font-black tracking-tighter text-white/90">Historial</h1>
          </div>
        </div>
        <Link
          href="/nuevo"
          className="bg-white text-black px-6 py-3.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-[0.95]"
        >
          + Nuevo
        </Link>
      </div>

      <div className="space-y-10 mb-20">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/20 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/[0.01] border border-white/5 rounded-[1.2rem] pl-14 pr-6 py-4 text-sm text-foreground placeholder:text-muted/10 focus:border-primary/20 transition-all outline-none shadow-inner"
          />
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar">
          {(["todos", "ingreso", "gasto"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-3.5 rounded-[1.2rem] text-[8px] font-black transition-all shrink-0 uppercase tracking-[0.4em] border ${
                filtro === f
                  ? "bg-white border-white text-black shadow-xl scale-105"
                  : "bg-white/[0.01] border-white/5 text-muted/20 hover:text-muted/40"
              }`}
            >
              {f === "todos" ? "Todos" : f === "ingreso" ? "Ingresos" : "Gastos"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-24 text-center border border-dashed border-white/[0.03] rounded-[2.5rem]">
          <p className="text-muted/10 text-[9px] font-black uppercase tracking-[0.6em]">Sin resultados</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((mov) => (
            <div key={mov._id} className="glass-card p-5 transition-all border-white/[0.02] bg-white/[0.01] group active:scale-[0.98]">
              {editId === mov._id ? (
                <div className="space-y-6 p-2">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted/20 uppercase tracking-[0.4em] ml-2">Descripción</label>
                    <input
                      type="text"
                      value={editData.descripcion ?? mov.descripcion}
                      onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                      className="w-full bg-white/[0.02] rounded-xl px-5 py-4 text-sm text-foreground border border-white/5 outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted/20 uppercase tracking-[0.4em] ml-2">Monto</label>
                    <input
                      type="number"
                      value={editData.monto ?? mov.monto}
                      onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                      className="w-full bg-white/[0.02] rounded-xl px-5 py-4 text-sm text-foreground border border-white/5 outline-none"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => handleEdit(mov._id)} className="flex-1 bg-white text-black text-[9px] py-4.5 rounded-xl font-black uppercase tracking-[0.3em]">Guardar</button>
                    <button onClick={() => setEditId(null)} className="px-5 bg-white/5 text-muted/30 text-xs py-4.5 rounded-xl"><X className="w-5 h-5" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-[1.2rem] bg-white/[0.02] flex items-center justify-center text-xl shrink-0">
                    {getCategoryIcon(mov.categoria)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black truncate text-white/90 tracking-tight">
                      {mov.descripcion}
                    </p>
                    <p className="text-[9px] font-black text-muted/20 uppercase tracking-[0.2em] mt-1.5">
                      {formatDateShort(mov.fecha)} · {mov.categoria}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[15px] font-black tracking-tighter ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                      {mov.tipo === "ingreso" ? "+" : ""}
                      {formatMoney(mov.monto, mov.moneda)}
                    </p>
                    {mov.moneda === "USD" && mov.montoARS && (
                      <p className="text-[8px] font-black text-muted/10 mt-1 uppercase tracking-widest">
                        ≈ {formatMoney(mov.montoARS)}
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditId(mov._id); setEditData({ descripcion: mov.descripcion, monto: mov.monto }); }}
                        className="p-2 rounded-lg text-muted/20 hover:text-primary transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(mov._id)}
                        className="p-2 rounded-lg text-muted/20 hover:text-danger transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
