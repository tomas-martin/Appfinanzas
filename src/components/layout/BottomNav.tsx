"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ArrowLeftRight, Plus, PiggyBank, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/movimientos", icon: ArrowLeftRight, label: "Actividad" },
  { href: "/nuevo", icon: Plus, label: "Nuevo", isCenter: true },
  { href: "/presupuesto", icon: PiggyBank, label: "Budget" },
  { href: "/estadisticas", icon: BarChart3, label: "Stats" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-container">
      <div className="nav-content">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-0.5 transition-all active:scale-90"
              >
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-white/10">
                  <Icon className="w-5 h-5 stroke-[2.5px]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${isActive
                  ? "text-white bg-white/10"
                  : "text-[--color-muted]"
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}