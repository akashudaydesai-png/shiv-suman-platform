"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "@/lib/api";
import { fallbackBranches, fallbackCourses } from "@/lib/public-fallbacks";

type Installment = { id: string; sequence: number; purpose: string; amount: number };
type Branch = { id: string; name: string; code: string };
type Plan = {
  id: string;
  name: string;
  branchId?: string | null;
  branch?: Branch | null;
  durationDays: number;
  vehicleClasses: string[];
  totalAmount: number;
  active: boolean;
  installments: Installment[];
};
type InstallmentFormRow = { purpose: string; amount: string };

const emptyInstallments: InstallmentFormRow[] = Array.from({ length: 5 }, () => ({ purpose: "", amount: "" }));
const emptyForm = {
  name: "",
  branchId: "__ALL_BRANCHES__",
  durationDays: "12",
  vehicleClasses: "LMV",
  totalAmount: "",
  installments: emptyInstallments
};

const demoBranches: Branch[] = fallbackBranches.map((branch) => ({ id: branch.id, name: branch.name, code: branch.code }));
const demoPlans: Plan[] = fallbackCourses.map((course) => ({
  ...course,
  active: true,
  branchId: null,
  branch: null
}));

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("shiv_suman_token");
    return fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers ?? {}) }
    });
  }

  async function loadPlans() {
    if (localStorage.getItem("shiv_suman_token") === "demo-vercel-session") {
      setPlans(demoPlans);
      return;
    }
    try {
      const response = await authFetch("/plans?includeInactive=true");
      if (response.ok) setPlans(await response.json());
      else setPlans(demoPlans);
    } catch {
      setPlans(demoPlans);
    }
  }

  async function loadBranches() {
    if (localStorage.getItem("shiv_suman_token") === "demo-vercel-session") {
      setBranches(demoBranches);
      return;
    }
    try {
      const response = await authFetch("/branches");
      if (response.ok) setBranches(await response.json());
      else setBranches(demoBranches);
    } catch {
      setBranches(demoBranches);
    }
  }

  useEffect(() => {
    loadPlans();
    loadBranches();
  }, []);

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId) ?? null, [plans, selectedPlanId]);

  function mapInstallmentsToForm(installments: Installment[]) {
    const rows = Array.from({ length: 5 }, (_, index) => {
      const installment = installments[index];
      return {
        purpose: installment?.purpose ?? "",
        amount: installment?.amount ? String(installment.amount) : ""
      };
    });
    return rows;
  }

  function startCreate() {
    setSelectedPlanId(null);
    setForm({ ...emptyForm, installments: [...emptyInstallments] });
  }

  function startEdit(plan: Plan) {
    setSelectedPlanId(plan.id);
    setForm({
      name: plan.name,
      branchId: plan.branchId ?? "__ALL_BRANCHES__",
      durationDays: String(plan.durationDays),
      vehicleClasses: plan.vehicleClasses.join(", "),
      totalAmount: String(plan.totalAmount),
      installments: mapInstallmentsToForm(plan.installments)
    });
  }

  function updateInstallment(index: number, field: keyof InstallmentFormRow, value: string) {
    setForm((current) => ({
      ...current,
      installments: current.installments.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    }));
  }

  function parsedInstallments() {
    return form.installments
      .map((item, index) => ({
        sequence: index + 1,
        purpose: item.purpose.trim(),
        amount: Number(item.amount || 0)
      }))
      .filter((item) => item.purpose && item.amount > 0);
  }

  async function savePlan() {
    const installments = parsedInstallments();
    if (!form.name.trim()) {
      setMessage("Course name is required.");
      return;
    }
    if (!installments.length) {
      setMessage("At least one installment is required.");
      return;
    }
    setMessage(selectedPlanId ? "Updating course..." : "Creating course...");

    const payload = {
      name: form.name,
      branchId: form.branchId === "__ALL_BRANCHES__" ? null : form.branchId,
      durationDays: Number(form.durationDays || 12),
      vehicleClasses: form.vehicleClasses.split(",").map((item) => item.trim()).filter(Boolean),
      totalAmount: Number(form.totalAmount || 0),
      installments
    };

    const response = await authFetch(selectedPlanId ? `/plans/${selectedPlanId}` : "/plans", {
      method: selectedPlanId ? "PATCH" : "POST",
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      setMessage(selectedPlanId ? "Course update failed." : "Course create failed.");
      return;
    }

    setMessage(selectedPlanId ? "Course updated." : "Course created.");
    startCreate();
    await loadPlans();
  }

  async function setPlanActive(id: string, active: boolean) {
    await authFetch(`/plans/${id}/${active ? "resume" : "pause"}`, { method: "POST" });
    await loadPlans();
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Plans / Courses</h1>
        <p className="mt-2 text-black/65">Create and edit courses. Add up to 5 installments. Fill only the rows needed.</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-md border border-brand-teal/20 bg-white p-4 shadow-soft">
          <button className="w-full rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={startCreate} type="button">
            Add New Course
          </button>
          <div className="mt-4 grid gap-3">
            {plans.map((plan) => (
              <article key={plan.id} className={`rounded-md border p-3 ${selectedPlanId === plan.id ? "border-brand-teal bg-brand-mist" : "border-black/10 bg-white"}`}>
                <button className="w-full text-left" onClick={() => startEdit(plan)} type="button">
                  <p className="font-semibold text-brand-ink">{plan.name}</p>
                  <p className="mt-1 text-xs text-black/60">{plan.durationDays} days | Rs {plan.totalAmount}</p>
                  <p className="mt-1 text-xs text-black/50">Branch: {plan.branch?.name ?? "All Branches"}</p>
                  <p className={`mt-1 inline-flex rounded-md px-2 py-1 text-[11px] font-bold ${plan.active ? "bg-brand-teal/10 text-brand-teal" : "bg-brand-orange/10 text-brand-orange"}`}>
                    {plan.active ? "ACTIVE" : "PAUSED"}
                  </p>
                </button>
                <button
                  className={`mt-2 rounded-md px-3 py-2 text-xs font-semibold text-white ${plan.active ? "bg-brand-orange" : "bg-brand-teal"}`}
                  onClick={() => setPlanActive(plan.id, !plan.active)}
                  type="button"
                >
                  {plan.active ? "Pause" : "Resume"}
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-brand-ink">{selectedPlan ? `Edit Course: ${selectedPlan.name}` : "Create New Course"}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <input className="rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Course name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
              <option value="__ALL_BRANCHES__">All Branches</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Days" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Total amount" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} />
            <input className="rounded-md border border-black/15 px-3 py-2 md:col-span-4" placeholder="Vehicle classes (comma separated) e.g. LMV,MCWG" value={form.vehicleClasses} onChange={(e) => setForm({ ...form, vehicleClasses: e.target.value })} />
          </div>

          <div className="mt-5 rounded-md border border-brand-teal/15 bg-brand-mist p-4">
            <p className="font-semibold text-brand-ink">Installments (up to 5)</p>
            <div className="mt-3 grid gap-3">
              {form.installments.map((item, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[90px_1fr_180px]">
                  <div className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-brand-ink">#{index + 1}</div>
                  <input className="rounded-md border border-black/15 bg-white px-3 py-2" placeholder={`Installment ${index + 1} purpose`} value={item.purpose} onChange={(e) => updateInstallment(index, "purpose", e.target.value)} />
                  <input className="rounded-md border border-black/15 bg-white px-3 py-2" placeholder="Amount" value={item.amount} onChange={(e) => updateInstallment(index, "amount", e.target.value.replace(/[^0-9]/g, ""))} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-md bg-brand-teal px-5 py-3 font-semibold text-white" onClick={savePlan} type="button">
              {selectedPlan ? "Save Changes" : "Create Course"}
            </button>
            {selectedPlan ? (
              <button className="rounded-md border border-brand-teal px-5 py-3 font-semibold text-brand-teal" onClick={startCreate} type="button">
                Cancel Edit
              </button>
            ) : null}
          </div>
          {message ? <p className="mt-3 text-sm font-semibold text-brand-teal">{message}</p> : null}
        </div>
      </section>
    </div>
  );
}
