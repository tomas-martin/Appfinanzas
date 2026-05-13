"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, Filter, X } from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon } from "@/lib/utils";
import Link from "next/link";

interface Mov {
  _id: string;
  tipo: string;
  monto: number;
  moneda: string;
  descripcion: string;
  categoria: string;
  fecha: string;
}

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Mov[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "gasto" | "ingreso">("todos");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Mov>>({});

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

  const filtered =
    filtro === "todos"
      ? movimientos
      : movimientos.filter((m) => m.tipo === filtro);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Movimientos</h1>
        <Link
          href="/nuevo"
          className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium"
        >
          + Nuevo
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(["todos", "ingreso", "gasto"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filtro === f
                ? "bg-primary text-white"
                : "bg-surface-light text-muted"
            }`}
          >
            <Filter className="w-3 h-3 inline mr-1" />
            {f === "todos" ? "Todos" : f === "ingreso" ? "Ingresos" : "Gastos"}
          </button>
        ))}
      </div>

      {/* Movement list */}
      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-muted text-sm">No hay movimientos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((mov) => (
            <div key={mov._id} className="glass-card p-3.5">
              {editId === mov._id ? (
                /* Edit mode */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.descripcion ?? mov.descripcion}
                    onChange={(e) =>
                      setEditData({ ...editData, descripcion: e.target.value })
                    }
                    className="w-full bg-surface-light rounded-lg px-3 py-2 text-sm text-foreground border border-border"
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
                    className="w-full bg-surface-light rounded-lg px-3 py-2 text-sm text-foreground border border-border"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(mov._id)}
                      className="flex-1 bg-primary text-white text-xs py-2 rounded-lg font-medium"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-3 bg-surface-light text-muted text-xs py-2 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Display mode */
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-lg shrink-0">
                    {getCategoryIcon(mov.categoria)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {mov.descripcion}
                    </p>
                    <p className="text-[10px] text-muted">
                      {formatDateShort(mov.fecha)} · {mov.categoria}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold mr-2 ${
                      mov.tipo === "ingreso" ? "text-success" : "text-danger"
                    }`}
                  >
                    {mov.tipo === "ingreso" ? "+" : "-"}
                    {formatMoney(mov.monto, mov.moneda as "ARS" | "USD")}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditId(mov._id);
                        setEditData({
                          descripcion: mov.descripcion,
                          monto: mov.monto,
                        });
                      }}
                      className="p-1.5 rounded-lg bg-surface-light text-muted hover:text-primary transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(mov._id)}
                      className="p-1.5 rounded-lg bg-surface-light text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
