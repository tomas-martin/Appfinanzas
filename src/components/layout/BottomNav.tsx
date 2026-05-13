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
    <nav className="nav-container">
      <div className="nav-content">
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
                className="relative -top-1 transition-all active:scale-[0.85]"
              >
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                  <Icon className="w-6 h-6 stroke-[3px]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
                isActive ? "text-white bg-white/10" : "text-muted/50"
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
