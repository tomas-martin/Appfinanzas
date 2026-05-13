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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
      <div className="glass-card flex items-center justify-around px-2 py-3 bg-surface/40 backdrop-blur-3xl border-white/10 shadow-2xl">
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
                className="relative -top-8 transition-transform active:scale-90"
              >
                <div className="w-16 h-16 rounded-3xl btn-primary flex items-center justify-center shadow-2xl shadow-primary/40 border-[6px] border-background rotate-45">
                  <Icon className="w-8 h-8 text-white -rotate-45" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center gap-1 py-1 px-4 transition-all duration-300 ${
                isActive ? "text-primary" : "text-muted/50 hover:text-muted"
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? "bg-primary/10 scale-110 shadow-inner" : ""}`}>
                <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
              </div>
              <span className={`text-[9px] font-extrabold tracking-tighter uppercase transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
