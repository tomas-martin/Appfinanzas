"use client";

import { signIn } from "next-auth/react";
import { Wallet, ChevronRight, Globe } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-between bg-black text-white p-8 relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-[-20%] right-[-20%] w-[100%] h-[60%] bg-gradient-to-br from-white/[0.05] to-transparent rounded-full blur-3xl rotate-12" />
      
      <div className="w-full max-w-sm mt-32 z-10">
        <div className="mb-16">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            <Wallet className="w-8 h-8 text-black stroke-[2.5px]" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none mb-4">
            Gestión de<br />Capital
          </h1>
          <div className="flex items-center gap-2 text-white/40">
            <Globe className="w-3.5 h-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Global Finance Standard</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm z-10 mb-20 space-y-8">
        <div className="space-y-4">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] px-2">Acceso Seguro</p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group w-full bg-white text-black font-black py-6 rounded-2xl text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all"
          >
            Google Account
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="flex justify-between items-center px-2 pt-8 border-t border-white/5">
          <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Totti Edition 2026</span>
          <div className="flex gap-4">
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="w-1 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
