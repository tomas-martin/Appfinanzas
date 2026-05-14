"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, Plus, Target, Calendar, Trash2, X, Check } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Meta {
  _id: string;
  nombre: string;
  montoObjetivo: number;
  fechaLimite: string;
  color: string;
}

export default function MetasPage() {
  const router = useRouter();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [mRes, bRes] = await Promise.all([
        fetch("/api/metas"),
        fetch("/api/movimientos/dashboard")
      ]);
      const metasData = await mRes.json();
      const dashData = await bRes.json();
      
      setMetas(Array.isArray(metasData) ? metasData : []);
      setBalance(dashData.balance || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !monto || !fecha) return;
    setSaving(true);
    try {
      await fetch("/api/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          montoObjetivo: Number(monto),
          fechaLimite: fecha,
        }),
      });
      setNombre("");
      setMonto("");
      setFecha("");
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta meta?")) return;
    await fetch(`/api/metas/${id}`, { method: "DELETE" });
    setMetas(prev => prev.filter(m => m._id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-mobile fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mt-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3.5 rounded-full bg-[#111111] border border-white/5 active:scale-90 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tighter">Metas</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-xl active:scale-90 transition-all">
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6 stroke-[3px]" />}
        </button>
      </div>

      {/* Balance info */}
      <div className="premium-card p-6 mb-10 text-center bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-2">Balance Actual</p>
        <h2 className="text-3xl font-black">{formatMoney(balance)}</h2>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="premium-card p-6 mb-8 ring-1 ring-primary/20 space-y-4">
          <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">Nueva Meta de Ahorro</p>
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block ml-2">¿Qué quieres lograr?</label>
            <input required type="text" placeholder="Ej: Viaje a Japón" value={nombre} onChange={e => setNombre(e.target.value)}
              className="input-premium py-3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block ml-2">Monto Objetivo</label>
              <input required type="number" placeholder="0" value={monto} onChange={e => setMonto(e.target.value)}
                className="input-premium py-3 font-black" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block ml-2">Fecha Límite</label>
              <input required type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="input-premium py-3" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Confirmar Meta</>}
          </button>
        </form>
      )}

      {/* Goals list */}
      <div className="space-y-4">
        {metas.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-white/5 rounded-[2.5rem] opacity-30">
            <Target className="w-8 h-8 mx-auto mb-4 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Sin metas activas</p>
          </div>
        ) : (
          metas.map(meta => {
            const pct = Math.min((balance / meta.montoObjetivo) * 100, 100);
            const daysLeft = Math.ceil((new Date(meta.fechaLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={meta._id} className="premium-card p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-white/90">{meta.nombre}</h3>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft} días restantes` : "Plazo vencido"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(meta._id)} className="p-2 text-muted/20 hover:text-danger active:scale-90 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Progreso</p>
                      <p className="text-sm font-black text-white">{formatMoney(balance)} <span className="text-[10px] text-muted font-bold tracking-normal">/ {formatMoney(meta.montoObjetivo)}</span></p>
                    </div>
                    <p className={`text-xl font-black ${pct >= 100 ? "text-success" : "text-white/40"}`}>{Math.round(pct)}%</p>
                  </div>
                  
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${pct >= 100 ? "bg-success" : "bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
