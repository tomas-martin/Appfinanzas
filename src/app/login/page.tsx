"use client";

import { signIn } from "next-auth/react";
import { Wallet, ChevronRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-between bg-black text-white overflow-hidden p-6 sm:p-8">
      {/* Fondo con resplandores animados */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-emerald-600/10 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>
      
      <div className="w-full max-w-sm mt-10 sm:mt-16 z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_15px_40px_rgba(79,70,229,0.3)] border border-white/10">
          <Wallet className="w-8 h-8 text-white stroke-[2.5px]" />
        </div>
        <div className="text-center px-4">
          <h1 className="text-5xl font-black tracking-tighter leading-none mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Gestión de<br />Capital
          </h1>
          <div className="flex flex-col items-center gap-4">
            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Finanzas Pro
            </p>
            <p className="text-[12px] text-white/30 leading-relaxed max-w-[240px] mx-auto font-medium">
              Control total de tus gastos, tarjetas y ahorros en una sola suite diseñada para la eficiencia.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm z-10 mb-6 sm:mb-10 space-y-10">
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group w-full bg-white text-black font-extrabold py-5 rounded-2xl text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 active:scale-[0.96] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
          >
            Entrar con Google
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="h-px w-8 bg-white/10" />
          <div className="text-center space-y-1.5">
            <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.4em]">
              Tomas Martin
            </p>
            <p className="text-[7px] font-bold text-white/10 uppercase tracking-[0.2em]">
              Todos los derechos reservados © 2026
            </p>
          </div>
        </div>
      </div>

      {/* Textura de grano sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
