"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, Filter, X, Search, ChevronLeft } from "lucide-react";
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
        `/api/movimientos?mes=${now.getMonth()}&anio=${now.getFullYear()}`
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
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile pt-8 pb-36 fade-in">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 rounded-2xl bg-surface-light/30 border border-white/5 text-muted hover:text-primary transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tight uppercase gradient-text">Historial</h1>
        </div>
        <Link
          href="/nuevo"
          className="btn-primary text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
        >
          + Nuevo
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="space-y-6 mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all rounded-3xl" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar movimientos..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="relative w-full bg-surface-light/20 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-sm text-foreground placeholder:text-muted/20 focus:border-primary/30 transition-all outline-none backdrop-blur-md"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {(["todos", "ingreso", "gasto"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all shrink-0 uppercase tracking-[0.2em] border ${
                filtro === f
                  ? "bg-primary border-primary text-white shadow-xl shadow-primary/30 scale-105"
                  : "bg-surface-light/20 border-white/5 text-muted/40 hover:text-muted hover:bg-surface-light/40"
              }`}
            >
              {f === "todos" ? "Todos" : f === "ingreso" ? "Ingresos" : "Gastos"}
            </button>
          ))}
        </div>
      </div>

      {/* Movement list */}
      {filtered.length === 0 ? (
        <div className="glass-card p-20 text-center border-dashed border-white/10 bg-transparent">
          <div className="w-20 h-20 bg-surface-light/20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <Filter className="w-10 h-10 text-muted/10" />
          </div>
          <p className="text-muted/40 text-xs font-black uppercase tracking-[0.2em]">Sin resultados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((mov) => (
            <div key={mov._id} className="glass-card p-4 transition-all border-white/5 group active:scale-[0.98]">
              {editId === mov._id ? (
                <div className="space-y-4 p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted/50 uppercase tracking-widest ml-1">Descripción</label>
                    <input
                      type="text"
                      value={editData.descripcion ?? mov.descripcion}
                      onChange={(e) =>
                        setEditData({ ...editData, descripcion: e.target.value })
                      }
                      className="w-full bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted/50 uppercase tracking-widest ml-1">Monto</label>
                    <input
                      type="number"
                      value={editData.monto ?? mov.monto}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          monto: Number(e.target.value),
                        })
                      }
                      className="w-full bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEdit(mov._id)}
                      className="flex-1 btn-primary text-white text-[10px] py-4 rounded-2xl font-black uppercase tracking-[0.2em]"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-5 bg-surface-light/50 text-muted text-xs py-4 rounded-2xl border border-white/5"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-light/50 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(mov.categoria)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black truncate tracking-tight">
                      {mov.descripcion}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-bold text-muted/40 uppercase tracking-widest">
                        {formatDateShort(mov.fecha)}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-muted/20" />
                      <p className="text-[10px] font-black text-muted/60 uppercase tracking-widest">
                        {mov.categoria}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-black tracking-tighter ${
                        mov.tipo === "ingreso" ? "text-success" : "text-foreground"
                      }`}
                    >
                      {mov.tipo === "ingreso" ? "+" : ""}
                      {formatMoney(mov.monto, mov.moneda as "ARS" | "USD")}
                    </p>
                    {mov.moneda === "USD" && mov.montoARS && (
                      <p className="text-[10px] font-bold text-muted/30 mt-0.5">
                        ≈ {formatMoney(mov.montoARS)}
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditId(mov._id);
                          setEditData({
                            descripcion: mov.descripcion,
                            monto: mov.monto,
                          });
                        }}
                        className="p-2 rounded-lg bg-white/5 text-muted/40 hover:text-primary hover:bg-primary/10 transition-all border border-white/5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(mov._id)}
                        className="p-2 rounded-lg bg-white/5 text-muted/40 hover:text-danger hover:bg-danger/10 transition-all border border-white/5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
