"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  CreditCard,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/movimientos", icon: ArrowLeftRight, label: "Historial" },
  { href: "/nuevo", icon: Plus, label: "Nuevo", isCenter: true },
  { href: "/tarjetas", icon: CreditCard, label: "Tarjetas" },
  { href: "/estadisticas", icon: BarChart3, label: "Stats" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-nav left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-[420px]">
      <div className="glass-card flex items-center justify-between px-8 py-3.5 bg-white/[0.01] backdrop-blur-3xl border-white/[0.04] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)]">
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
                className="relative -top-10 transition-all active:scale-[0.85] duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl border-[4px] border-[#060912]">
                  <Icon className="w-7 h-7 stroke-[3px]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center gap-1 transition-all duration-500 ${
                isActive ? "text-white" : "text-muted/10 hover:text-muted/30"
              }`}
            >
              <div className={`relative p-2.5 rounded-xl transition-all duration-500 ${isActive ? "bg-white/[0.03] scale-110 shadow-inner" : ""}`}>
                <Icon className={`relative w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
              </div>
              <span className={`text-[7px] font-black tracking-[0.2em] uppercase transition-all ${isActive ? "opacity-40" : "opacity-0"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
