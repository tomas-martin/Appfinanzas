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
    <div className="container-mobile pt-8 pb-32 fade-in">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-surface-light/30 border border-white/5 text-muted hover:text-primary transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tight uppercase gradient-text">Historial</h1>
        </div>
        <Link
          href="/nuevo"
          className="btn-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          Nuevo
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
          <input 
            type="text" 
            placeholder="Buscar por descripción..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-surface-light/30 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted/30 focus:border-primary/30 transition-all outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["todos", "ingreso", "gasto"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all shrink-0 uppercase tracking-widest border ${
                filtro === f
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "bg-surface-light/30 border-white/5 text-muted/60 hover:text-muted hover:bg-surface-light/50"
              }`}
            >
              {f === "todos" ? "Todos" : f === "ingreso" ? "Ingresos" : "Gastos"}
            </button>
          ))}
        </div>
      </div>

      {/* Movement list */}
      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center border-dashed border-white/10 bg-transparent">
          <div className="w-20 h-20 bg-surface-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-10 h-10 text-muted/20" />
          </div>
          <p className="text-muted text-sm font-medium">No se encontraron movimientos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((mov) => (
            <div key={mov._id} className="glass-card p-4 transition-all hover:bg-surface-light/30 border-white/5 group">
              {editId === mov._id ? (
                <div className="space-y-4 p-2 animate-in fade-in zoom-in-95 duration-200">
                  <input
                    type="text"
                    value={editData.descripcion ?? mov.descripcion}
                    onChange={(e) =>
                      setEditData({ ...editData, descripcion: e.target.value })
                    }
                    className="w-full bg-surface-light rounded-xl px-4 py-3 text-sm text-foreground border border-white/10 focus:border-primary/50 outline-none"
                  />
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(mov._id)}
                      className="flex-1 btn-primary text-white text-xs py-3 rounded-xl font-bold uppercase tracking-widest"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-4 bg-surface-light/50 text-muted text-xs py-3 rounded-xl border border-white/5"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-light flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(mov.categoria)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate tracking-tight">
                      {mov.descripcion}
                    </p>
                    <p className="text-[11px] font-medium text-muted/60 uppercase tracking-wider mt-0.5">
                      {formatDateShort(mov.fecha)} · {mov.categoria}
                    </p>
                  </div>
                  <div className="text-right mr-2">
                    <p
                      className={`text-base font-black tracking-tighter ${
                        mov.tipo === "ingreso" ? "text-success" : "text-danger"
                      }`}
                    >
                      {mov.tipo === "ingreso" ? "+" : "-"}
                      {formatMoney(mov.monto, mov.moneda as "ARS" | "USD")}
                    </p>
                    {mov.moneda === "USD" && mov.montoARS && (
                      <p className="text-[10px] font-bold text-muted/40 mt-0.5">
                        ≈ {formatMoney(mov.montoARS)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditId(mov._id);
                        setEditData({
                          descripcion: mov.descripcion,
                          monto: mov.monto,
                        });
                      }}
                      className="p-2 rounded-lg bg-surface-light/50 text-muted hover:text-primary transition-colors border border-white/5"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mov._id)}
                      className="p-2 rounded-lg bg-surface-light/50 text-muted hover:text-danger transition-colors border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
