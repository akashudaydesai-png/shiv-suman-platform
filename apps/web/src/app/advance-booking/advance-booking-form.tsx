"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type Branch = { id: string; name: string; startTime?: string; endTime?: string };
type Plan = { id: string; name: string; durationDays: number; totalAmount: number; branchId?: string | null };

export function AdvanceBookingForm({
  branches,
  onSubmitted
}: {
  branches: Branch[];
  onSubmitted?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [branchOptions, setBranchOptions] = useState<Branch[]>(branches);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    branchId: branchOptions[0]?.id ?? branches[0]?.id ?? "",
    slotId: "",
    planName: ""
  });

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function loadBranches() {
      try {
        const response = await fetch(`${apiBaseUrl}/public/branches`, { cache: "no-store" });
        if (!response.ok || !mounted) return;
        const data = await response.json() as Branch[];
        if (!mounted) return;
        setBranchOptions(data);
        setForm((current) => ({
          ...current,
          branchId: data.some((branch) => branch.id === current.branchId) ? current.branchId : data[0]?.id ?? "",
          slotId: data.some((branch) => branch.id === current.branchId) ? current.slotId : ""
        }));
      } catch {
        if (mounted) setBranchOptions([]);
      }
    }

    fetch(`${apiBaseUrl}/public/courses`)
      .then((response) => response.ok ? response.json() : [])
      .then(setPlans)
      .catch(() => setPlans([]));
    loadBranches();
    intervalId = setInterval(loadBranches, 15000);
    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const selectedBranch = useMemo(() => branchOptions.find((branch) => branch.id === form.branchId), [branchOptions, form.branchId]);
  const slotOptions = useMemo(() => buildSlots(selectedBranch?.startTime ?? "07:00", selectedBranch?.endTime ?? "20:00"), [selectedBranch?.startTime, selectedBranch?.endTime]);
  const visiblePlans = plans.filter((plan) => !plan.branchId || !form.branchId || plan.branchId === form.branchId);
  useEffect(() => {
    if (!form.slotId) return;
    if (slotOptions.includes(form.slotId)) return;
    setForm((current) => ({ ...current, slotId: "" }));
  }, [slotOptions, form.slotId]);

  async function submit() {
    setMessage("Creating booking...");
    const response = await fetch(`${apiBaseUrl}/public/advance-bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      setMessage("Booking failed. Name, phone, and branch are required.");
      return;
    }

    setMessage("Learning car advance booking created for Rs 500 adjustment.");
    setForm({ fullName: "", phone: "", email: "", branchId: branchOptions[0]?.id ?? "", slotId: "", planName: "" });
    onSubmitted?.();
  }

  return (
    <form className="mt-8 grid gap-4 rounded-md border border-brand-teal/20 bg-white p-6 shadow-soft" onSubmit={(event) => event.preventDefault()}>
      <input className="rounded-md border border-black/15 px-3 py-3" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      <input className="rounded-md border border-black/15 px-3 py-3" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input className="rounded-md border border-black/15 px-3 py-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <select className="rounded-md border border-black/15 px-3 py-3" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value, slotId: "" })}>
        {branchOptions.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
      </select>
      <select className="rounded-md border border-black/15 px-3 py-3" value={form.slotId} onChange={(e) => setForm({ ...form, slotId: e.target.value })}>
        <option value="">Preferred slot time</option>
        {slotOptions.map((slot) => <option key={slot} value={slot}>{formatSlot(slot)}</option>)}
      </select>
      <select className="rounded-md border border-black/15 px-3 py-3" value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })}>
        <option value="">Select learning car plan/course</option>
        {visiblePlans.map((plan) => <option key={plan.id} value={plan.name}>{plan.name} - {plan.durationDays} days - Rs {plan.totalAmount}</option>)}
      </select>
      <button type="button" className="rounded-md bg-brand-orange px-4 py-3 font-semibold text-white" onClick={submit}>
        Pay Rs 500 And Book
      </button>
      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
    </form>
  );
}

function buildSlots(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const result: string[] = [];
  let cursor = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  while (cursor < endTotal) {
    result.push(`${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`);
    cursor += 30;
  }
  return result;
}

function formatSlot(slot: string) {
  const [hourText, minute] = slot.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}
