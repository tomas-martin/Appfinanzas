"use client";

import { signIn } from "next-auth/react";
import { Wallet, ChevronRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-between bg-black text-white relative overflow-hidden p-8">
      {/* Fondo con resplandores animados */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/15 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-emerald-600/10 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>
      
      <div className="w-full max-w-sm mt-8 z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center mb-8 shadow-[0_20px_50px_rgba(79,70,229,0.3)] border border-white/10">
          <Wallet className="w-10 h-10 text-white stroke-[2.5px]" />
        </div>
        <div className="text-center px-2">
          <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Gestión de<br />Capital
          </h1>
          <p className="text-indigo-400 text-[12px] font-bold uppercase tracking-[0.3em] mb-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Finanzas Pro
          </p>
          <p className="text-[13px] text-white/40 leading-relaxed max-w-[280px] mx-auto font-medium">
            Tus gastos, tarjetas y ahorros en una sola suite diseñada para el control total.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm z-10 mb-6 space-y-12">
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group w-full bg-white text-black font-extrabold py-6 rounded-2xl text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 active:scale-[0.96] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            Entrar con Google
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="h-px w-12 bg-white/20" />
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">
              Tomas Martin
            </p>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
              Todos los derechos reservados © 2026
            </p>
          </div>
        </div>
      </div>

      {/* Textura de grano sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
