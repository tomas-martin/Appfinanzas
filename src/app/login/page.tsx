"use client";

import { signIn } from "next-auth/react";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-between bg-black text-white py-24 px-10">
      <div className="flex flex-col items-center text-center mt-20">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-10 rotate-6 shadow-2xl">
          <Wallet className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">Finanzas</h1>
        <p className="text-muted text-sm font-medium uppercase tracking-[0.3em]">Maneja tu capital con estilo</p>
      </div>

      <div className="w-full max-w-sm space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted/60">
            <div className="w-1.5 h-1.5 rounded-full bg-success" /> Simple
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted/60">
            <div className="w-1.5 h-1.5 rounded-full bg-info" /> Seguro
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted/60">
            <div className="w-1.5 h-1.5 rounded-full bg-warning" /> Potente
          </div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-white text-black font-extrabold py-6 rounded-[2rem] text-xs uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl"
        >
          Acceder con Google
        </button>

        <p className="text-center text-[8px] font-bold text-muted/20 uppercase tracking-[0.6em]">
          Version 2.0 · Apple Edition
        </p>
      </div>
    </div>
  );
}
