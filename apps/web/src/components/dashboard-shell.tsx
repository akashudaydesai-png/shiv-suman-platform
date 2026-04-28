"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BranchSelector } from "@/components/branch-selector";

const menu = [
  ["Admin Dashboard", "/dashboard/admin"],
  ["RTO Work", "/dashboard/rto"],
  ["Enquiries", "/dashboard/enquiries"],
  ["Advance Booking", "/dashboard/advance-bookings"],
  ["Branches", "/dashboard/branches"],
  ["Documents", "/dashboard/documents"],
  ["Students", "/dashboard/students"],
  ["AI Assistant", "/dashboard/ai-assistant"],
  ["Staff", "/dashboard/staff"],
  ["Plans / Courses", "/dashboard/plans"],
  ["Blog CMS", "/dashboard/blog-cms"],
  ["Contact CMS", "/dashboard/contact-cms"],
  ["Cars", "/dashboard/cars"],
  ["Users Access", "/dashboard/users"],
  ["Settings", "/dashboard/settings"]
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-white">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-brand-teal/20 bg-white px-4 py-5 shadow-soft transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-brand-teal/15 pb-4">
          <Image alt="Shiv Suman Logo" className="h-12 w-12 rounded-md object-cover" height={56} src="/logo.jpeg" width={56} />
          <div>
            <p className="text-lg font-extrabold text-brand-ink">Shiv Suman</p>
            <p className="text-xs font-semibold text-brand-orange">Motor Training School</p>
          </div>
        </div>
        <nav className="mt-6 grid gap-2">
          {menu.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className="rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-brand-ink transition hover:border-brand-teal/20 hover:bg-brand-mist"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className={`transition-all duration-200 ${sidebarOpen ? "lg:pl-72" : "lg:pl-0"}`}>
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-brand-teal/15 bg-white px-3 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="grid h-10 w-10 place-items-center rounded-md border border-brand-teal/20 bg-brand-mist text-brand-teal transition hover:bg-brand-teal hover:text-white"
              onClick={() => setSidebarOpen((value) => !value)}
              type="button"
            >
              <span className="sr-only">{sidebarOpen ? "Close sidebar" : "Open sidebar"}</span>
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
              </span>
            </button>
            <p className="truncate font-semibold text-brand-ink">Operations Dashboard</p>
          </div>
          <BranchSelector />
        </header>
        <main className="bg-white p-3 sm:p-5">{children}</main>
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
