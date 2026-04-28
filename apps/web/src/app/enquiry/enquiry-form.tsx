"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type Branch = { id: string; name: string; startTime?: string; endTime?: string };
type Plan = { id: string; name: string; durationDays: number; totalAmount: number; branchId?: string | null };
type RtoService = { id: string; name: string; feeAmount: number };

export function EnquiryForm({
  mode = "public",
  onSubmitted
}: {
  mode?: "public" | "dashboard";
  onSubmitted?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [rtoServices, setRtoServices] = useState<RtoService[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    source: mode === "public" ? "Website" : "Admin/Reception",
    type: "learning_car",
    preferredBranchId: "",
    courseOrService: "",
    preferredSlotTime: "",
    notes: ""
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
        setBranches(data);
        setForm((current) => ({
          ...current,
          preferredBranchId: data.some((branch) => branch.id === current.preferredBranchId)
            ? current.preferredBranchId
            : data[0]?.id || "",
          preferredSlotTime: data.some((branch) => branch.id === current.preferredBranchId) ? current.preferredSlotTime : ""
        }));
      } catch {
        if (mounted) setBranches([]);
      }
    }

    fetch(`${apiBaseUrl}/public/courses`)
      .then((response) => response.ok ? response.json() : [])
      .then(setPlans)
      .catch(() => setPlans([]));
    loadBranches();
    intervalId = setInterval(loadBranches, 15000);
    fetch(`${apiBaseUrl}/public/rto-services`)
      .then((response) => response.ok ? response.json() : [])
      .then(setRtoServices)
      .catch(() => setRtoServices([]));
    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  async function submit() {
    setMessage("Submitting enquiry...");
    const token = typeof window !== "undefined" ? localStorage.getItem("shiv_suman_token") : null;
    const response = await fetch(`${apiBaseUrl}${mode === "dashboard" ? "/enquiries" : "/public/enquiries"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(mode === "dashboard" && token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      setMessage("Enquiry failed. Name and phone are required.");
      return;
    }

    setForm({
      fullName: "",
      phone: "",
      email: "",
      source: mode === "public" ? "Website" : "Admin/Reception",
      type: "learning_car",
      preferredBranchId: branches[0]?.id ?? "",
      courseOrService: "",
      preferredSlotTime: "",
      notes: ""
    });
    setMessage("Enquiry submitted. Reception can now follow up.");
    onSubmitted?.();
  }

  const selectedBranch = useMemo(() => branches.find((branch) => branch.id === form.preferredBranchId), [branches, form.preferredBranchId]);
  const slotOptions = useMemo(() => buildSlots(selectedBranch?.startTime ?? "07:00", selectedBranch?.endTime ?? "20:00"), [selectedBranch?.startTime, selectedBranch?.endTime]);
  const visiblePlans = plans.filter((plan) => !plan.branchId || !form.preferredBranchId || plan.branchId === form.preferredBranchId);
  useEffect(() => {
    if (!form.preferredSlotTime) return;
    if (slotOptions.includes(form.preferredSlotTime)) return;
    setForm((current) => ({ ...current, preferredSlotTime: "" }));
  }, [slotOptions, form.preferredSlotTime]);

  return (
    <form className="mt-8 grid gap-4 rounded-md border border-brand-teal/20 bg-white p-6 shadow-soft" onSubmit={(event) => event.preventDefault()}>
      <input className="rounded-md border border-black/15 px-3 py-3" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      <input className="rounded-md border border-black/15 px-3 py-3" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input className="rounded-md border border-black/15 px-3 py-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <select className="rounded-md border border-black/15 px-3 py-3" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
        <option value="Website">Website</option>
        <option value="Walk-in">Walk-in</option>
        <option value="Google Ads">Google Ads</option>
        <option value="Instagram">Instagram</option>
        <option value="Referral">Referral</option>
        <option value="Admin/Reception">Admin/Reception</option>
      </select>
      <select className="rounded-md border border-black/15 px-3 py-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
        <option value="learning_car">Learning car</option>
        <option value="rto_work">RTO work</option>
      </select>
      <select className="rounded-md border border-black/15 px-3 py-3" value={form.preferredBranchId} onChange={(e) => setForm({ ...form, preferredBranchId: e.target.value, courseOrService: "", preferredSlotTime: "" })}>
        <option value="">Preferred branch</option>
        {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
      </select>
      <select className="rounded-md border border-black/15 px-3 py-3" value={form.preferredSlotTime} onChange={(e) => setForm({ ...form, preferredSlotTime: e.target.value })}>
        <option value="">Preferred slot time</option>
        {slotOptions.map((slot) => <option key={slot} value={slot}>{formatSlot(slot)}</option>)}
      </select>
      {form.type === "learning_car" ? (
        <select className="rounded-md border border-black/15 px-3 py-3" value={form.courseOrService} onChange={(e) => setForm({ ...form, courseOrService: e.target.value })}>
          <option value="">Select plan/course</option>
          {visiblePlans.map((plan) => (
            <option key={plan.id} value={plan.name}>{plan.name} - {plan.durationDays} days - Rs {plan.totalAmount}</option>
          ))}
        </select>
      ) : (
        <select className="rounded-md border border-black/15 px-3 py-3" value={form.courseOrService} onChange={(e) => setForm({ ...form, courseOrService: e.target.value })}>
          <option value="">Select RTO service</option>
          {rtoServices.map((service) => (
            <option key={service.id} value={service.name}>{service.name}{service.feeAmount ? ` - Rs ${service.feeAmount}` : ""}</option>
          ))}
        </select>
      )}
      <textarea className="rounded-md border border-black/15 px-3 py-3" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      <button type="button" className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={submit}>
        Submit Enquiry
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
