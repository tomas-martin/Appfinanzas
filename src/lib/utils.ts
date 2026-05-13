import { Moneda } from "@/types";

export function formatMoney(amount: number, moneda: Moneda = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: moneda === "ARS" ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString("es-AR", { day: "2-digit" });
  const month = date.toLocaleDateString("es-AR", { month: "2-digit" });
  return `${day}/${month}`;
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month, 1);
  return new Intl.DateTimeFormat("es-AR", { month: "long" }).format(date);
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

export function getCategoryIcon(categoria: string): string {
  const icons: Record<string, string> = {
    Comida: "🍔",
    Transporte: "🚗",
    Entretenimiento: "🎬",
    Salud: "💊",
    Educación: "📚",
    Servicios: "💡",
    Ropa: "👕",
    Hogar: "🏠",
    Tecnología: "💻",
    Suscripciones: "📱",
    Salario: "💰",
    Freelance: "💼",
    Inversiones: "📈",
    Venta: "🏷️",
    Regalo: "🎁",
    Reembolso: "↩️",
    Otros: "📦",
  };
  return icons[categoria] || "📦";
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
