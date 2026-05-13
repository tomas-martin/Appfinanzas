"use client";

import { signIn } from "next-auth/react";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-10 relative overflow-hidden bg-[#060912]">
      {/* Premium Background Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-primary/[0.03] rounded-full blur-[120px] animate-pulse" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full py-20">
        {/* Animated Logo */}
        <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-16 shadow-2xl shadow-primary/20 rotate-6 hover:rotate-0 transition-all duration-700 group cursor-pointer border border-white/10">
          <Wallet className="w-14 h-14 text-white group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Title & Tagline */}
        <div className="mb-16">
          <h1 className="text-5xl font-black mb-6 tracking-tighter">
            <span className="text-white">Mis</span>
            <span className="text-primary-light">Finanzas</span>
          </h1>
          <p className="text-muted/50 text-base font-medium leading-relaxed max-w-[300px] mx-auto">
            La forma más inteligente y elegante de controlar tu dinero.
          </p>
        </div>

        {/* Premium Features Card */}
        <div className="glass-card p-10 w-full mb-20 space-y-10 border-white/[0.05] bg-white/[0.01] backdrop-blur-3xl shadow-2xl">
          {[
            { icon: "⚡", title: "Rápido", text: "Registros en segundos" },
            { icon: "🛡️", title: "Seguro", text: "Tus datos están encriptados" },
            { icon: "📊", title: "Visual", text: "Gráficos que dicen la verdad" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-6 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-2xl group-hover:bg-primary/10 transition-all duration-300 border border-white/5 shadow-inner">
                {item.icon}
              </div>
              <div>
                <p className="text-[11px] font-black text-primary-light uppercase tracking-[0.2em] mb-1">{item.title}</p>
                <p className="text-sm font-bold text-muted/60">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Google Sign In Button */}
        <div className="w-full space-y-10">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            id="google-sign-in-btn"
            className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-6 px-8 rounded-[2rem] hover:bg-gray-100 active:scale-[0.95] transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.15)] text-sm uppercase tracking-[0.2em]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Empezar ahora
          </button>

          <p className="text-muted/20 text-[10px] font-black uppercase tracking-[0.5em]">
            V. 1.0 · 2026
          </p>
        </div>
      </div>
    </div>
  );
}
