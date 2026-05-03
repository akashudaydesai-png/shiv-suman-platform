"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Bot,
  Building2,
  CalendarClock,
  Car,
  FileText,
  Gauge,
  Home,
  Inbox,
  LockKeyhole,
  MapPinned,
  Menu,
  Newspaper,
  Settings,
  ShieldCheck,
  UserRoundCog,
  UsersRound
} from "lucide-react";
import { BranchSelector } from "@/components/branch-selector";

const menu = [
  ["Admin Dashboard", "/dashboard/admin", Gauge],
  ["RTO Work", "/dashboard/rto", ShieldCheck],
  ["Enquiries", "/dashboard/enquiries", Inbox],
  ["Advance Booking", "/dashboard/advance-bookings", CalendarClock],
  ["Branches", "/dashboard/branches", Building2],
  ["Documents", "/dashboard/documents", FileText],
  ["Students", "/dashboard/students", UsersRound],
  ["AI Assistant", "/dashboard/ai-assistant", Bot],
  ["Staff", "/dashboard/staff", UserRoundCog],
  ["Plans / Courses", "/dashboard/plans", BookOpen],
  ["Blog CMS", "/dashboard/blog-cms", Newspaper],
  ["Contact CMS", "/dashboard/contact-cms", MapPinned],
  ["Cars", "/dashboard/cars", Car],
  ["Users Access", "/dashboard/users", LockKeyhole],
  ["Settings", "/dashboard/settings", Settings]
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const skipInputTypes = new Set([
      "email",
      "password",
      "url",
      "number",
      "date",
      "time",
      "datetime-local",
      "month",
      "week",
      "file",
      "hidden",
      "range",
      "color"
    ]);

    function toUppercase(value: string) {
      return value.replace(/[a-z]/g, (char) => char.toUpperCase());
    }

    function onInput(event: Event) {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      if (target instanceof HTMLInputElement && skipInputTypes.has((target.type || "text").toLowerCase())) return;

      const nextValue = toUppercase(target.value);
      if (nextValue === target.value) return;

      const start = target.selectionStart;
      const end = target.selectionEnd;
      target.value = nextValue;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      if (typeof start === "number" && typeof end === "number") target.setSelectionRange(start, end);
    }

    document.addEventListener("input", onInput, true);
    return () => {
      document.removeEventListener("input", onInput, true);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f8f6]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 overflow-y-auto border-r border-black/10 bg-white/95 px-4 py-5 shadow-[18px_0_60px_rgba(16,25,22,0.10)] backdrop-blur-xl transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 rounded-md border border-black/10 bg-[#f8fbfa] p-3">
          <Image alt="Shiv Suman Logo" className="h-12 w-12 rounded-md object-cover shadow-[0_12px_24px_rgba(16,25,22,0.14)]" height={56} src="/logo.jpeg" width={56} />
          <div>
            <p className="text-lg font-black text-brand-ink">Shiv Suman</p>
            <p className="text-xs font-black uppercase text-brand-orange">Operations OS</p>
          </div>
        </div>
        <nav className="mt-5 grid gap-1.5">
          {menu.map(([label, href, Icon]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm font-bold transition ${
                  active
                    ? "border-brand-teal/25 bg-brand-ink text-white shadow-[0_16px_34px_rgba(16,25,22,0.16)]"
                    : "border-transparent text-brand-ink hover:border-brand-teal/20 hover:bg-brand-mist hover:text-brand-teal"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-brand-orange" : "text-brand-teal"}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className={`transition-all duration-200 ${sidebarOpen ? "lg:pl-80" : "lg:pl-0"}`}>
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-white/82 px-3 py-3 shadow-[0_12px_42px_rgba(16,25,22,0.06)] backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="grid h-11 w-11 place-items-center rounded-md border border-black/10 bg-white text-brand-ink shadow-[0_10px_24px_rgba(16,25,22,0.08)] transition hover:bg-brand-ink hover:text-white"
              onClick={() => setSidebarOpen((value) => !value)}
              type="button"
            >
              <span className="sr-only">{sidebarOpen ? "Close sidebar" : "Open sidebar"}</span>
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-black uppercase text-brand-orange">Live control room</p>
              <p className="truncate text-lg font-black text-brand-ink">Operations Dashboard</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="hidden rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-bold text-brand-ink hover:border-brand-teal/30 hover:text-brand-teal sm:inline-flex" href="/">
              <Home className="mr-2 h-4 w-4" />
              Website
            </Link>
            <BranchSelector />
          </div>
        </header>
        <main className="min-h-[calc(100vh-76px)] bg-[radial-gradient(circle_at_0%_0%,rgba(255,138,0,0.08),transparent_24%),linear-gradient(180deg,#f7fbfa,#ffffff)] p-3 sm:p-5">
          <div className="mx-auto max-w-[1540px] premium-reveal">{children}</div>
        </main>
      </div>
      {sidebarOpen ? (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-brand-ink/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      ) : null}
    </div>
  );
}
