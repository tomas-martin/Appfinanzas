"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, Filter, X, Search, ChevronLeft, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Mov {
  _id: string;
  tipo: string;
  monto: number;
  moneda: string;
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
      const now = new Date();
      const res = await fetch(
        `/api/movimientos?mes=${now.getMonth()}&anio=${now.getFullYear()}`,
        { cache: "no-store" }
      );
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
        <div className="w-12 h-12 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-14 pb-44 fade-in">
      <div className="flex items-center justify-between mb-12 px-1">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 text-muted/40 hover:text-primary transition-all shadow-xl">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-muted/30 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Actividad</p>
            <h1 className="text-3xl font-black tracking-tighter">Historial</h1>
          </div>
        </div>
        <Link
          href="/nuevo"
          className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-[0.95]"
        >
          + Nuevo
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="space-y-8 mb-14">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/[0.03] blur-2xl group-focus-within:bg-primary/[0.06] transition-all rounded-[2rem]" />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/20 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por descripción..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="relative w-full bg-white/[0.02] border border-white/5 rounded-[1.5rem] pl-16 pr-6 py-5 text-base text-foreground placeholder:text-muted/20 focus:border-primary/30 transition-all outline-none backdrop-blur-3xl shadow-inner"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {(["todos", "ingreso", "gasto"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black transition-all shrink-0 uppercase tracking-[0.3em] border ${
                filtro === f
                  ? "bg-primary border-primary text-white shadow-2xl shadow-primary/20 scale-105"
                  : "bg-white/[0.02] border-white/5 text-muted/30 hover:text-muted/60 hover:bg-white/[0.04]"
              }`}
            >
              {f === "todos" ? "Todos" : f === "ingreso" ? "Ingresos" : "Gastos"}
            </button>
          ))}
        </div>
      </div>

      {/* Movement list */}
      {filtered.length === 0 ? (
        <div className="glass-card p-24 text-center border-dashed border-white/[0.05] bg-transparent">
          <div className="w-24 h-24 bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/[0.03]">
            <Filter className="w-10 h-10 text-muted/5" />
          </div>
          <p className="text-muted/20 text-[10px] font-black uppercase tracking-[0.5em]">Sin movimientos</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((mov) => (
            <div key={mov._id} className="glass-card p-6 transition-all border-white/[0.05] group active:scale-[0.98] hover:bg-white/[0.01]">
              {editId === mov._id ? (
                <div className="space-y-6 p-2 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted/30 uppercase tracking-[0.3em] ml-2">Descripción</label>
                    <input
                      type="text"
                      value={editData.descripcion ?? mov.descripcion}
                      onChange={(e) =>
                        setEditData({ ...editData, descripcion: e.target.value })
                      }
                      className="w-full bg-white/[0.03] rounded-2xl px-5 py-4 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none shadow-inner"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted/30 uppercase tracking-[0.3em] ml-2">Monto</label>
                    <input
                      type="number"
                      value={editData.monto ?? mov.monto}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          monto: Number(e.target.value),
                        })
                      }
                      className="w-full bg-white/[0.03] rounded-2xl px-5 py-4 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none shadow-inner"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleEdit(mov._id)}
                      className="flex-1 bg-primary text-white text-[10px] py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-6 bg-white/[0.03] text-muted/40 text-xs py-5 rounded-2xl border border-white/5"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition-transform ${mov.tipo === 'ingreso' ? 'bg-success/[0.03]' : 'bg-white/[0.02]'}`}>
                    {getCategoryIcon(mov.categoria)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black truncate tracking-tight text-white/90">
                      {mov.descripcion}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[10px] font-black text-muted/30 uppercase tracking-[0.2em]">
                        {formatDateShort(mov.fecha)}
                      </p>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/[0.05]" />
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">
                        {mov.categoria}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-black tracking-tighter ${
                        mov.tipo === "ingreso" ? "text-success" : "text-white"
                      }`}
                    >
                      {mov.tipo === "ingreso" ? "+" : ""}
                      {formatMoney(mov.monto, mov.moneda as "ARS" | "USD")}
                    </p>
                    {mov.moneda === "USD" && mov.montoARS && (
                      <p className="text-[10px] font-black text-muted/20 mt-1 uppercase tracking-widest">
                        ≈ {formatMoney(mov.montoARS)}
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditId(mov._id);
                          setEditData({
                            descripcion: mov.descripcion,
                            monto: mov.monto,
                          });
                        }}
                        className="p-2.5 rounded-xl bg-white/5 text-muted/30 hover:text-primary hover:bg-primary/10 transition-all border border-white/5"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mov._id)}
                        className="p-2.5 rounded-xl bg-white/5 text-muted/30 hover:text-danger hover:bg-danger/10 transition-all border border-white/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
