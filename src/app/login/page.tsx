"use client";

import { signIn } from "next-auth/react";
import { Wallet, CreditCard, TrendingUp, DollarSign } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-black text-white relative overflow-hidden px-6 py-12 select-none touch-none">
      {/* Fondo con efectos visuales */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-indigo-600/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-emerald-600/15 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-sm z-10 flex flex-col items-center gap-12">
        {/* Header Formal */}
        <div className="flex flex-col items-center text-center fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-[0_20px_40px_rgba(79,70,229,0.4)] border border-white/20">
            <Wallet className="w-8 h-8 text-white stroke-[2.5px]" />
          </div>
          <h1 className="text-[2.5rem] leading-[1.1] font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            Control de<br />Finanzas
          </h1>
          <p className="text-muted text-sm font-semibold tracking-wide">
            Tu ecosistema financiero personal
          </p>
        </div>

        {/* Lista de Capacidades */}
        <div className="w-full space-y-4 bg-white/[0.03] border border-white/10 rounded-[2rem] p-7 backdrop-blur-xl shadow-2xl fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-xs font-bold text-white/90 uppercase tracking-[0.15em]">Seguimiento de Gastos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-white/90 uppercase tracking-[0.15em]">Control de Tarjetas</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-xs font-bold text-white/90 uppercase tracking-[0.15em]">Cotización en Tiempo Real</p>
          </div>
        </div>

        {/* Footer y Botón */}
        <div className="w-full space-y-8 fade-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group w-full bg-white hover:bg-gray-100 text-black font-black py-4 rounded-2xl text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.97] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <img
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
              alt="Google"
              className="w-5 h-5"
            />
            Iniciar sesión
          </button>

          <div className="text-center space-y-2 opacity-50">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">
              Tomas Martin
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              Derechos Reservados © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Textura de grano sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
