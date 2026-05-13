"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  CreditCard,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/movimientos", icon: ArrowLeftRight, label: "Movimientos" },
  { href: "/nuevo", icon: PlusCircle, label: "Nuevo", isCenter: true },
  { href: "/tarjetas", icon: CreditCard, label: "Tarjetas" },
  { href: "/estadisticas", icon: BarChart3, label: "Stats" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <div className="glass-card flex items-center justify-between px-6 py-4 bg-surface/30 backdrop-blur-3xl border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase()}`}
                className="relative -top-10 transition-all active:scale-90"
              >
                <div className="w-16 h-16 rounded-2xl btn-primary flex items-center justify-center shadow-2xl shadow-primary/40 border-[5px] border-background">
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center transition-all duration-300 ${
                isActive ? "text-primary" : "text-muted/30 hover:text-muted/60"
              }`}
            >
              <div className={`relative p-2 rounded-2xl transition-all duration-300 ${isActive ? "bg-primary/10 scale-110" : ""}`}>
                {isActive && <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />}
                <Icon className={`relative w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
              </div>
              <span className={`text-[8px] font-black tracking-widest uppercase transition-all mt-1 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
