"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type RtoServiceOption = { id: string; name: string; feeAmount: number; category: string };
type ExternalCase = {
  id: string;
  status: string;
  createdAt: string;
  service: RtoServiceOption;
  customerJson: {
    fullName?: string;
    phone?: string;
    rcNumber?: string | null;
    insurance?: string | null;
    puc?: string | null;
    document1?: string | null;
    document2?: string | null;
    document3?: string | null;
    document4?: string | null;
    notes?: string | null;
  };
};

type ExternalForm = {
  fullName: string;
  phone: string;
  serviceId: string;
  rcNumber: string;
  insurance: string;
  puc: string;
  document1: string;
  document2: string;
  document3: string;
  document4: string;
  notes: string;
};

const emptyForm: ExternalForm = {
  fullName: "",
  phone: "",
  serviceId: "",
  rcNumber: "",
  insurance: "",
  puc: "",
  document1: "",
  document2: "",
  document3: "",
  document4: "",
  notes: ""
};

export default function ExternalRtoWorkPage() {
  const [cases, setCases] = useState<ExternalCase[]>([]);
  const [services, setServices] = useState<RtoServiceOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ExternalForm>(emptyForm);
  const [message, setMessage] = useState("Loading external RTO work...");

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("shiv_suman_token");
    return fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {})
      }
    });
  }

  async function loadData() {
    const [casesResponse, servicesResponse] = await Promise.all([
      authFetch("/rto/external"),
      fetch(`${apiBaseUrl}/public/rto-services`)
    ]);
    if (casesResponse.ok) {
      const data = (await casesResponse.json()) as ExternalCase[];
      setCases(data);
      setMessage(data.length ? "" : "No external RTO cases yet. Click Add New to create the first one.");
    } else {
      setMessage("Unable to load external RTO work. Please login again.");
    }
    if (servicesResponse.ok) setServices(await servicesResponse.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateForm(field: keyof ExternalForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleDocumentFile(field: keyof ExternalForm, event: ChangeEvent<HTMLInputElement>) {
    updateForm(field, event.target.files?.[0]?.name ?? "");
  }

  async function createCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Creating external RTO case...");
    const response = await authFetch("/rto/external", {
      method: "POST",
      body: JSON.stringify(form)
    });
    if (!response.ok) {
      setMessage("External RTO case create failed. Name, mobile, and service are required.");
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    setMessage("External RTO case created.");
    await loadData();
  }

  return (
    <div className="grid gap-6">
      <section>
        <Link className="text-sm font-semibold text-brand-teal" href="/dashboard/rto">Back to RTO Work</Link>
        <h1 className="mt-3 text-3xl font-bold text-brand-ink">External Customer RTO Work</h1>
        <p className="mt-2 text-black/65">Create and track RTO service work for customers who are not training students.</p>
      </section>

      <section>
        <button className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={() => setShowForm((value) => !value)} type="button">
          {showForm ? "Close Form" : "Add New"}
        </button>
      </section>

      {showForm ? (
        <form className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft" onSubmit={createCase}>
          <h2 className="text-xl font-bold text-brand-ink">Add external RTO customer</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Customer name" value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Mobile number" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.serviceId} onChange={(e) => updateForm("serviceId", e.target.value)}>
              <option value="">Select RTO service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - Rs {service.feeAmount}
                </option>
              ))}
            </select>
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="RC number optional" value={form.rcNumber} onChange={(e) => updateForm("rcNumber", e.target.value)} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Insurance optional" value={form.insurance} onChange={(e) => updateForm("insurance", e.target.value)} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="PUC optional" value={form.puc} onChange={(e) => updateForm("puc", e.target.value)} />
            <label className="grid gap-2 rounded-md border border-black/15 px-3 py-2 text-sm text-black/65">
              Document 1 optional
              <input type="file" onChange={(event) => handleDocumentFile("document1", event)} />
            </label>
            <label className="grid gap-2 rounded-md border border-black/15 px-3 py-2 text-sm text-black/65">
              Document 2 optional
              <input type="file" onChange={(event) => handleDocumentFile("document2", event)} />
            </label>
            <label className="grid gap-2 rounded-md border border-black/15 px-3 py-2 text-sm text-black/65">
              Document 3 optional
              <input type="file" onChange={(event) => handleDocumentFile("document3", event)} />
            </label>
            <label className="grid gap-2 rounded-md border border-black/15 px-3 py-2 text-sm text-black/65">
              Document 4 optional
              <input type="file" onChange={(event) => handleDocumentFile("document4", event)} />
            </label>
            <textarea className="min-h-24 rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Notes optional" value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
          </div>
          <button className="mt-5 rounded-md bg-brand-orange px-4 py-3 font-semibold text-white" type="submit">Create RTO Case</button>
        </form>
      ) : null}

      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}

      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-brand-teal text-white">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Service</th>
              <th className="p-3">RC Number</th>
              <th className="p-3">Insurance</th>
              <th className="p-3">PUC</th>
              <th className="p-3">Documents</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((rtoCase) => {
              const docs = [
                rtoCase.customerJson.document1,
                rtoCase.customerJson.document2,
                rtoCase.customerJson.document3,
                rtoCase.customerJson.document4
              ].filter(Boolean);
              return (
                <tr key={rtoCase.id} className="border-t border-brand-teal/10">
                  <td className="p-3 font-semibold text-brand-ink">{rtoCase.customerJson.fullName ?? "-"}</td>
                  <td className="p-3">{rtoCase.customerJson.phone ?? "-"}</td>
                  <td className="p-3">{rtoCase.service.name}</td>
                  <td className="p-3">{rtoCase.customerJson.rcNumber ?? "-"}</td>
                  <td className="p-3">{rtoCase.customerJson.insurance ?? "-"}</td>
                  <td className="p-3">{rtoCase.customerJson.puc ?? "-"}</td>
                  <td className="p-3">{docs.length ? `${docs.length} added` : "Optional"}</td>
                  <td className="p-3">
                    <span className="rounded-md bg-brand-orange/10 px-2 py-1 text-xs font-semibold text-brand-orange">{rtoCase.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
