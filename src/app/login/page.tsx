"use client";

import { signIn } from "next-auth/react";
import { Wallet, ChevronRight, ShieldCheck, Zap, TrendingUp, Globe } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-between bg-black text-white overflow-hidden p-6">
      {/* Fondo con efectos visuales */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>
      
      {/* Header Compacto */}
      <div className="w-full max-w-sm mt-6 z-10 flex flex-col items-center">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_15px_40px_rgba(79,70,229,0.3)] border border-white/10">
          <Wallet className="w-7 h-7 text-white stroke-[2.5px]" />
        </div>
        <div className="text-center px-4">
          <h1 className="text-4xl font-black tracking-tighter leading-none mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Gestión de Capital
          </h1>
          <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-[0.4em] mb-2">
            Professional Suite v2.6
          </p>
        </div>
      </div>

      {/* Feature Showcase (Lo que faltaba) */}
      <div className="w-full max-w-[320px] z-10 py-4 space-y-4">
        {/* Mockup de Tarjeta/Balance */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12" />
          </div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Balance Estimado</p>
          <p className="text-2xl font-black mb-4">$450.200,00</p>
          <div className="flex gap-2">
            <div className="h-1 flex-1 bg-emerald-500/40 rounded-full" />
            <div className="h-1 w-8 bg-white/10 rounded-full" />
          </div>
        </div>

        {/* Mini Features Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">Tiempo Real</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/60">Dólar Blue</span>
          </div>
        </div>
      </div>

      {/* Footer y Botón */}
      <div className="w-full max-w-sm z-10 mb-6 space-y-8">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="group w-full bg-white text-black font-extrabold py-5 rounded-2xl text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 active:scale-[0.96] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
        >
          Entrar con Google
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        <div className="text-center space-y-1.5 opacity-40">
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">
            Tomas Martin
          </p>
          <p className="text-[7px] font-bold uppercase tracking-[0.2em]">
            Elite Financial Control © 2026
          </p>
        </div>
      </div>

      {/* Textura de grano sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
