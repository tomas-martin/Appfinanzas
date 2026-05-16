"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ArrowLeftRight, Plus, PiggyBank, BarChart3 } from "lucide-react";

const NAV = [
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
        {NAV.map(item => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCenter) return (
            <Link key={item.href} href={item.href}
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
              style={{ background: "var(--color-text)", color: "var(--color-bg)" }}>
              <Icon size={20} strokeWidth={2.5} />
            </Link>
          );

          return (
            <Link key={item.href} href={item.href}
              className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all"
              style={{
                color: active ? "var(--color-text)" : "var(--color-muted-2)",
                background: active ? "var(--color-surface-3)" : "transparent",
              }}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}