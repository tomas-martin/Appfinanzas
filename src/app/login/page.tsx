"use client";

import { signIn } from "next-auth/react";
import { Wallet, ChevronRight, CheckCircle2, CreditCard, TrendingUp, DollarSign } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-between bg-black text-white overflow-hidden p-6 select-none touch-none">
      {/* Fondo con efectos visuales */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/15 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-emerald-600/10 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>
      
      {/* Header Formal */}
      <div className="w-full max-w-sm mt-8 z-10 flex flex-col items-center">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_15px_40px_rgba(79,70,229,0.3)] border border-white/10">
          <Wallet className="w-7 h-7 text-white stroke-[2.5px]" />
        </div>
        <div className="text-center px-4">
          <h1 className="text-4xl font-black tracking-tighter leading-none mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Control de<br />Capital
          </h1>
        </div>
      </div>

      {/* Lista de Capacidades (Formal y Limpia) */}
      <div className="w-full max-w-[300px] z-10 space-y-4">
        <div className="space-y-3 bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Seguimiento de Gastos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Control de Tarjetas</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Cotización Dólar Blue</p>
          </div>
        </div>
      </div>

      {/* Footer y Botón de Google Oficial */}
      <div className="w-full max-w-sm z-10 mb-8 space-y-10">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="group w-full bg-white text-black font-black py-5 rounded-2xl text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 active:scale-[0.96] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] overflow-hidden relative"
        >
          <img 
            src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
            alt="Google" 
            className="w-5 h-5 mr-1"
          />
          Iniciar sesión
        </button>

        <div className="text-center space-y-1.5 opacity-30">
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">
            Tomas Martin
          </p>
          <p className="text-[7px] font-bold uppercase tracking-[0.2em]">
            Estrategia Financiera © 2026
          </p>
        </div>
      </div>

      {/* Textura de grano sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
