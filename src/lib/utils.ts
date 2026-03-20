import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const months = [
    "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
    "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  const months = [
    "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
    "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
  ];
  const h = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${min}`;
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "tani";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min më parë`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} orë më parë`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ditë më parë`;
  return formatDate(d);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + "...";
}

export const CATEGORIES = [
  { name: "Botë", slug: "botë", color: "#6366f1" },
  { name: "Politikë", slug: "politikë", color: "#8b5cf6" },
  { name: "Konflikt", slug: "konflikt", color: "#ef4444" },
  { name: "Ekonomi", slug: "ekonomi", color: "#10b981" },
  { name: "Teknologji", slug: "teknologji", color: "#3b82f6" },
  { name: "Sport", slug: "sport", color: "#f59e0b" },
  { name: "Shëndetësi", slug: "shëndetësi", color: "#ec4899" },
  { name: "Shkencë", slug: "shkencë", color: "#14b8a6" },
  { name: "Kulturë", slug: "kulturë", color: "#f97316" },
] as const;

export function getCategoryColor(category: string): string {
  const cat = CATEGORIES.find(
    (c) => c.slug === category || c.name.toLowerCase() === category.toLowerCase()
  );
  return cat?.color || "#6366f1";
}

export function getCategoryName(slug: string): string {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  return cat?.name || slug;
}

export const URGENCY_CONFIG = {
  breaking: { label: "Lajm i Fundit", color: "#ef4444", bgColor: "bg-red-500/10", textColor: "text-red-400" },
  update: { label: "Përditësim", color: "#f59e0b", bgColor: "bg-amber-500/10", textColor: "text-amber-400" },
  analysis: { label: "Analizë", color: "#3b82f6", bgColor: "bg-blue-500/10", textColor: "text-blue-400" },
} as const;
