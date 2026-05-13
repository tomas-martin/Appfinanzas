"use client";

import { signIn } from "next-auth/react";
import { Wallet, ChevronRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-between bg-black text-white relative overflow-hidden p-8">
      {/* Animated Gradient Background - Fixed to viewport */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/15 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>
      
      <div className="w-full max-w-sm mt-20 z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(79,70,229,0.3)] border border-white/10">
          <Wallet className="w-10 h-10 text-white stroke-[2.5px]" />
        </div>
        <div className="text-center">
          <h1 className="text-6xl font-black tracking-tighter leading-[0.85] mb-6">
            Elite<br />
            <span className="text-indigo-400">Finance.</span>
          </h1>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400/50" />
            Secure Asset Manager
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm z-10 mb-12 space-y-12">
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group w-full bg-white text-black font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.96] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            Google Login
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="h-px w-10 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="text-center space-y-2">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
              Tomas Martin
            </p>
            <p className="text-[7px] font-bold text-white/10 uppercase tracking-[0.2em]">
              Todos los derechos reservados © 2026
            </p>
          </div>
        </div>
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
