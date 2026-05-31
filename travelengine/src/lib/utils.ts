import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(s)} – ${new Intl.DateTimeFormat("en-US", { day: "numeric", year: "numeric" }).format(e)}`;
  }
  return `${formatDate(s)} – ${formatDate(e)}`;
}

export function getDaysBetween(start: string | Date, end: string | Date): number {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const ACTIVITY_TYPES = [
  { value: "TRANSPORT", label: "Transport", icon: "Plane" },
  { value: "ACCOMMODATION", label: "Accommodation", icon: "Hotel" },
  { value: "ATTRACTION", label: "Attraction", icon: "Camera" },
  { value: "DINING", label: "Dining", icon: "UtensilsCrossed" },
  { value: "ACTIVITY", label: "Activity", icon: "Compass" },
  { value: "SHOPPING", label: "Shopping", icon: "ShoppingBag" },
  { value: "EVENT", label: "Event", icon: "Ticket" },
  { value: "REST", label: "Rest", icon: "Coffee" },
] as const;

export const TRIP_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  PLANNED: { label: "Planned", color: "bg-blue-100 text-blue-700" },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Completed", color: "bg-purple-100 text-purple-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
} as const;

export const BUDGET_CATEGORIES = [
  { value: "FLIGHT", label: "Flights", color: "#3366FF" },
  { value: "HOTEL", label: "Hotels", color: "#20B2AA" },
  { value: "TRANSPORT", label: "Transport", color: "#FF9933" },
  { value: "FOOD", label: "Food & Dining", color: "#9B59B6" },
  { value: "ACTIVITY", label: "Activities", color: "#E74C3C" },
  { value: "SHOPPING", label: "Shopping", color: "#2ECC71" },
  { value: "INSURANCE", label: "Insurance", color: "#95A5A6" },
  { value: "VISA", label: "Visa & Docs", color: "#F39C12" },
  { value: "OTHER", label: "Other", color: "#7F8C8D" },
] as const;
