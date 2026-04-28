"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { apiBaseUrl } from "@/lib/api";

type Branch = { id: string; name: string; startTime: string; endTime: string };
type SlotResult = { status: string; message: string; remainingDays: number | null; branchName: string; time: string };

const liveCards = [
  { label: "Live batch/session status", value: "18 running", detail: "Branch-wise active training sessions", href: "/dashboard/students" },
  { label: "Running sessions", value: "12 cars", detail: "Trainer, student, and car currently mapped", href: "/dashboard/students" },
  { label: "Car location/status", value: "9 active", detail: "Fleet devices online and session-linked", href: "/dashboard/cars" },
  { label: "Trainer/student/car mapping", value: "18 mapped", detail: "Today assigned pairings and car allocation", href: "/dashboard/staff" }
];

const workCards = [
  { label: "Pending RTO work", value: "24", tone: "orange", detail: "Internal and external RTO cases pending action", href: "/dashboard/rto" },
  { label: "Own student license pending work", value: "11", detail: "LL/DL work connected to admitted students", href: "/dashboard/rto" },
  { label: "Enquiry follow-up", value: "32", detail: "Lead follow-ups by branch and time slot demand", href: "/dashboard/enquiries" },
  { label: "Advance booking queue", value: "14", detail: "Booked slots and upcoming joining confirmations", href: "/dashboard/advance-bookings" },
  { label: "Today leave", value: "7", detail: "Student leave and trainer leave status", href: "/dashboard/students" },
  { label: "Today free slots", value: "9", detail: "Open slots from leave and normal availability", href: "/dashboard/branches" }
];

const performanceCards = [
  { label: "Reception performance", value: "86%", detail: "Enquiries, admissions, RTO updates, documents ready", href: "/dashboard/staff" },
  { label: "Supervisor performance", value: "91%", detail: "DL practice, readiness, test event handling", href: "/dashboard/staff" },
  { label: "Trainer performance", value: "88%", detail: "Attendance, sessions completed, feedback quality", href: "/dashboard/staff" },
  { label: "Staff attendance and leave", value: "3 leave", detail: "Staff attendance, trainer leave requests, approvals", href: "/dashboard/staff" },
  { label: "Student progress", value: "128 active", detail: "Training days, LL status, DL readiness, pass-out status", href: "/dashboard/students" },
  { label: "Fleet/camera alerts", value: "5", tone: "orange", detail: "Harsh events, missing recording, device offline alerts", href: "/dashboard/cars" }
];

const adminActions = [
  ["Manage students", "/dashboard/students"],
  ["Manage trainers", "/dashboard/staff"],
  ["Manage supervisors", "/dashboard/staff"],
  ["Manage reception users", "/dashboard/users"],
  ["Enquiry module", "/dashboard/enquiries"],
  ["Advance booking", "/dashboard/advance-bookings"],
  ["Create branch", "/dashboard/branches"],
  ["Create dynamic course", "/dashboard/plans"],
  ["Installment rules", "/dashboard/plans"],
  ["RTO services", "/dashboard/rto"],
  ["Document requirements", "/dashboard/settings"],
  ["SMS/WhatsApp templates", "/dashboard/settings"],
  ["Role permissions", "/dashboard/users"],
  ["Website and blog CMS", "/blog"]
];

export function AdminDashboardClient() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedTime, setSelectedTime] = useState("");
  const [slotResult, setSlotResult] = useState<SlotResult | null>(null);

  useEffect(() => {
    fetch(`${apiBaseUrl}/public/branches`)
      .then((response) => response.ok ? response.json() : [])
      .then((data) => {
        setBranches(data);
        setSelectedBranch(localStorage.getItem("shiv_suman_branch") ?? "all");
      });

    const listener = (event: Event) => {
      setSelectedBranch((event as CustomEvent<string>).detail);
      setSlotResult(null);
    };
    window.addEventListener("shiv-suman-branch-change", listener);
    return () => window.removeEventListener("shiv-suman-branch-change", listener);
  }, []);

  const activeBranch = branches.find((branch) => branch.id === selectedBranch) ?? branches[0];
  const slots = useMemo(() => buildSlots(activeBranch?.startTime ?? "07:00", activeBranch?.endTime ?? "20:00"), [activeBranch]);

  async function checkSlot() {
    if (!activeBranch || !selectedTime) return;
    const token = localStorage.getItem("shiv_suman_token");
    const response = await fetch(`${apiBaseUrl}/branches/${activeBranch.id}/slot-availability?time=${selectedTime}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) setSlotResult(await response.json());
  }

  return (
    <div className="grid gap-6 pb-10">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Admin Dashboard</h1>
        <p className="mt-2 text-black/65">Complete control across branches, people, courses, installments, payments, RTO work, automation, fleet, and evidence.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/dashboard/rto"><MetricCard label="Income today" value="Rs 1,60,600" /></Link>
        <Link href="/dashboard/cars"><MetricCard label="Expenses today" value="Rs 18,400" tone="orange" /></Link>
        <Link href="/dashboard/plans"><MetricCard label="Profit / loss" value="Rs 1,42,200" /></Link>
        <Link href="/dashboard/settings"><MetricCard label="System alerts" value="6" tone="orange" /></Link>
      </section>

      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-brand-ink">Branch data filter</h2>
        <p className="mt-1 text-sm text-black/60">Selected: {selectedBranch === "all" ? "All branches" : activeBranch?.name ?? "Branch"}</p>
        <p className="mt-3 rounded-md bg-brand-mist px-4 py-3 text-sm font-semibold text-brand-teal">Use the top-right branch dropdown. Dashboard modules will read this branch state as more live data is added.</p>
      </section>

      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-brand-ink">Slot availability checker</h2>
        <p className="mt-1 text-sm text-black/60">Select a 30-minute slot and check if it is open or occupied.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <select className="min-w-56 rounded-md border border-brand-teal/30 px-3 py-2 text-sm" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
            <option value="">Select 30-minute slot</option>
            {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select>
          <button className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white" onClick={checkSlot} type="button">Check</button>
        </div>
        {slotResult ? (
          <div className="mt-5 rounded-md bg-brand-mist p-4">
            <p className="font-bold text-brand-ink">{slotResult.branchName} | {slotResult.time} | {slotResult.status}</p>
            <p className="mt-2 text-sm text-black/70">{slotResult.message}</p>
          </div>
        ) : null}
      </section>

      <DashboardSection title="Live Operations" cards={liveCards} />
      <DashboardSection title="Work Queue" cards={workCards} />
      <DashboardSection title="Performance And Monitoring" cards={performanceCards} />

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Link href="/dashboard/settings" className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft hover:border-brand-orange">
          <h2 className="text-xl font-bold text-brand-ink">Delete requests</h2>
          <p className="mt-1 text-sm text-black/60">Reception can request deletion. Admin approves or rejects with audit history.</p>
          <div className="mt-5 rounded-md bg-brand-mist p-4"><p className="text-sm font-semibold text-brand-ink">3 requests pending admin decision</p></div>
        </Link>
        <Link href="/dashboard/settings" className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft hover:border-brand-orange">
          <h2 className="text-xl font-bold text-brand-ink">System alerts</h2>
          <p className="mt-1 text-sm text-black/60">Payment, device, RTO, document, and automation alerts needing admin attention.</p>
          <div className="mt-5 rounded-md bg-brand-mist p-4"><p className="text-sm font-semibold text-brand-ink">6 alerts open across all branches</p></div>
        </Link>
      </section>

      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-brand-ink">Admin management</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {adminActions.map(([action, href]) => (
            <Link key={action} href={href} className="rounded-md border border-brand-teal/20 px-4 py-3 text-left text-sm font-semibold text-brand-ink hover:border-brand-orange">{action}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardSection({ title, cards }: { title: string; cards: Array<{ label: string; value: string; detail: string; href: string; tone?: string }> }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-brand-ink">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft hover:border-brand-orange">
            <div className="flex items-start justify-between gap-4">
              <p className="font-semibold text-brand-ink">{card.label}</p>
              <span className={card.tone === "orange" ? "rounded-md bg-brand-orange px-2 py-1 text-xs font-bold text-white" : "rounded-md bg-brand-mist px-2 py-1 text-xs font-bold text-brand-teal"}>{card.value}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-black/60">{card.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function buildSlots(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const slots: string[] = [];
  let cursor = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  while (cursor < endTotal) {
    slots.push(`${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`);
    cursor += 30;
  }
  return slots;
}
