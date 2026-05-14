"use client";

import { useEffect, useState } from "react";
import { Trash2, X, Search, ChevronLeft, Plus, Download } from "lucide-react";
import { formatMoney, formatDateShort, getCategoryIcon, getMonthName } from "@/lib/utils";
import { type Moneda } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Mov { _id: string; tipo: string; monto: number; moneda: Moneda; montoARS?: number; descripcion: string; categoria: string; fecha: string; }

function exportCSV(movimientos: Mov[]) {
  const header = "Fecha,Tipo,Descripcion,Categoria,Monto,Moneda\n";
  const rows = movimientos.map(m =>
    `${new Date(m.fecha).toLocaleDateString("es-AR")},${m.tipo},"${m.descripcion}",${m.categoria},${m.monto},${m.moneda}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `movimientos.csv`;
  a.click();
  URL.revokeObjectURL(url);
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
    setLoading(true);
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
    setMovimientos(prev => prev.filter(m => m._id !== id));
  }

  async function handleEdit(id: string) {
    await fetch(`/api/movimientos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData) });
    setEditId(null);
    fetchMovimientos();
  }

  const changeMonth = (delta: number) => {
    let newMes = mes + delta;
    let newAnio = anio;
    if (newMes < 0) { newMes = 11; newAnio--; }
    if (newMes > 11) { newMes = 0; newAnio++; }
    setMes(newMes);
    setAnio(newAnio);
  };

  const filtered = movimientos
    .filter(m => filtro === "todos" ? true : m.tipo === filtro)
    .filter(m => m.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

  const totalFiltrado = filtered.reduce((s, m) => m.tipo === "ingreso" ? s + (m.montoARS || m.monto) : s - (m.montoARS || m.monto), 0);

  if (loading) return <div className="flex items-center justify-center min-h-dvh"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container-mobile fade-up">
      <div className="flex items-center justify-between mt-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-3.5 rounded-full bg-[#111] border border-white/5 active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-3xl font-extrabold tracking-tighter">Actividad</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(filtered)} className="w-11 h-11 rounded-full bg-[#111] border border-white/5 flex items-center justify-center text-muted active:scale-90">
            <Download className="w-4.5 h-4.5" />
          </button>
          <Link href="/nuevo" className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-xl active:scale-90">
            <Plus className="w-5 h-5 stroke-[3px]" />
          </Link>
        </div>
      </div>

      <div className="space-y-5 mb-6">
        {/* Month nav */}
        <div className="flex items-center justify-between bg-[#0D0D0D] py-3 px-5 rounded-[2rem] border border-white/5">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full active:scale-75"><ChevronLeft className="w-5 h-5 text-muted" /></button>
          <span className="text-[11px] font-black uppercase tracking-[0.4em]">{getMonthName(mes)} {anio}</span>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full active:scale-75"><ChevronLeft className="w-5 h-5 text-muted rotate-180" /></button>
        </div>

        {/* Busqueda */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="input-premium pl-11 py-3.5" />
        </div>

        {/* Filtros + total */}
        <div className="flex items-center gap-2">
          {(["todos", "ingreso", "gasto"] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filtro === f ? "bg-white border-white text-black" : "bg-[#111] border-white/5 text-muted"}`}>
              {f === "todos" ? "Todo" : f === "ingreso" ? "Ingresos" : "Gastos"}
            </button>
          ))}
          <div className="ml-auto text-right">
            <p className={`text-[11px] font-black ${totalFiltrado >= 0 ? "text-success" : "text-danger"}`}>{formatMoney(Math.abs(totalFiltrado))}</p>
            <p className="text-[8px] text-muted">{filtered.length} items</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-white/5 rounded-3xl">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Sin movimientos</p>
          </div>
        ) : filtered.map(mov => (
          <div key={mov._id} onClick={() => editId !== mov._id && setEditId(mov._id)}
            className={`premium-card transition-all ${editId === mov._id ? "bg-[#151515] p-6 ring-2 ring-primary/20" : "p-4.5 active:scale-[0.98]"}`}>
            {editId === mov._id ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase tracking-widest text-primary">Editar</span>
                  <button onClick={e => { e.stopPropagation(); setEditId(null); }}><X className="w-4 h-4 text-muted" /></button>
                </div>
                <input autoFocus type="text" value={editData.descripcion ?? mov.descripcion} onChange={e => setEditData({ ...editData, descripcion: e.target.value })} className="input-premium py-3" />
                <input type="number" value={editData.monto ?? mov.monto} onChange={e => setEditData({ ...editData, monto: Number(e.target.value) })} className="input-premium py-3" />
                <div className="flex gap-3">
                  <button onClick={e => { e.stopPropagation(); handleEdit(mov._id); }} className="flex-1 btn-primary py-3 text-[10px]">Guardar</button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(mov._id); }} className="p-3 bg-danger/10 text-danger rounded-2xl"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-lg shrink-0">{getCategoryIcon(mov.categoria)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-[14px]">{mov.descripcion}</p>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-1">{formatDateShort(mov.fecha)} · {mov.categoria}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black text-[15px] ${mov.tipo === "ingreso" ? "text-success" : "text-white"}`}>
                    {mov.tipo === "ingreso" ? "+" : ""}{formatMoney(mov.monto)}
                  </p>
                  <p className="text-[9px] text-muted/30 uppercase mt-1">{mov.moneda}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
