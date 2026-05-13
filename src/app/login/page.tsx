"use client";

import { signIn } from "next-auth/react";
import { Wallet, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-between bg-black text-white relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/[0.02] blur-[150px] rounded-full" />
      
      <div className="flex flex-col items-center text-center mt-32 z-10 px-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
          <div className="w-24 h-24 bg-gradient-to-br from-white to-neutral-500 rounded-[2.5rem] flex items-center justify-center mb-12 rotate-3 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative z-10">
            <Wallet className="w-12 h-12 text-black stroke-[2.5px]" />
          </div>
        </div>
        
        <h1 className="text-6xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
          Finanzas
        </h1>
        <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.5em] max-w-[200px] leading-loose">
          Tu capital bajo control absoluto
        </p>
      </div>

      <div className="w-full max-w-sm space-y-12 z-10 px-8 mb-24">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">Seguridad Biométrica</p>
              <p className="text-[9px] text-white/30 font-medium">Tus datos encriptados de punta a punta</p>
            </div>
          </div>
          
          <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">IA Inteligente</p>
              <p className="text-[9px] text-white/30 font-medium">Predicciones de ahorro automáticas</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="group relative w-full active:scale-95 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-white blur-xl opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="relative bg-white text-black font-black py-6 rounded-[2.2rem] text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            Continuar con Google
          </div>
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="h-px w-12 bg-white/10" />
          <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.8em]">
            Apple Edition v2.5
          </p>
        </div>
      </div>

      {/* Subtle bottom noise or texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
