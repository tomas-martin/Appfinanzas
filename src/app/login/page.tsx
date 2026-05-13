"use client";

import { signIn } from "next-auth/react";
import { Wallet, ChevronRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-between bg-black text-white relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-violet-600/15 blur-[100px] rounded-full animate-bounce duration-[10s]" />
      </div>
      
      <div className="w-full max-w-sm mt-32 z-10 px-8">
        <div className="mb-20">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(79,70,229,0.4)]">
            <Wallet className="w-10 h-10 text-white stroke-[2.5px]" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-6">
            Control<br />
            <span className="text-indigo-400">Total.</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Vibrancy Edition 2026
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm z-10 mb-20 px-8 space-y-10">
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group w-full bg-white text-black font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_15px_40px_rgba(255,255,255,0.15)]"
          >
            Entrar con Google
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.6em]">
            by Totti Designs
          </p>
        </div>
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
