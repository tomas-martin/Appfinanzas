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
  { href: "/movimientos", icon: ArrowLeftRight, label: "Actividad" },
  { href: "/nuevo", icon: Plus, label: "Nuevo", isCenter: true },
  { href: "/tarjetas", icon: CreditCard, label: "Tarjetas" },
  { href: "/estadisticas", icon: BarChart3, label: "Stats" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-nav-forced left-0 right-0 z-50 flex justify-center px-8 pointer-events-none">
      <div className="flex items-center justify-between w-full max-w-[400px] bg-[#111111]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-3 shadow-2xl pointer-events-auto">
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
                className="relative -top-1 transition-all active:scale-[0.85] duration-500"
              >
                <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                  <Icon className="w-7 h-7 stroke-[3px]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 ${
                isActive ? "text-white bg-white/5" : "text-muted/40 hover:text-white/60"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
