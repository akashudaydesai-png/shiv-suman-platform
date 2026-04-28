"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type Branch = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  startTime: string;
  endTime: string;
  _count?: { users: number; vehicles: number; slots: number };
};

const emptyForm = {
  name: "",
  code: "",
  address: "",
  startTime: "07:00",
  endTime: "20:00"
};

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadBranches() {
    const token = localStorage.getItem("shiv_suman_token");
    const response = await fetch(`${apiBaseUrl}/branches`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) setBranches(await response.json());
  }

  useEffect(() => {
    loadBranches();
  }, []);

  async function saveBranch() {
    setMessage("Saving branch...");
    const token = localStorage.getItem("shiv_suman_token");
    const response = await fetch(`${apiBaseUrl}/branches${editingId ? `/${editingId}` : ""}`, {
      method: editingId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      setMessage("Branch create failed. Check name/code.");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setMessage(editingId ? "Branch updated." : "Branch created.");
    await loadBranches();
  }

  async function deleteBranch(id: string) {
    const token = localStorage.getItem("shiv_suman_token");
    await fetch(`${apiBaseUrl}/branches/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    await loadBranches();
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Branch Management</h1>
        <p className="mt-2 text-black/65">Create and manage branch timing, users, vehicles, and slots.</p>
      </section>

      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-brand-ink">Create branch</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-5">
          {[
            ["name", "Branch name"],
            ["code", "Code"],
            ["address", "Address"],
            ["startTime", "Start time"],
            ["endTime", "End time"]
          ].map(([key, label]) => (
            <label key={key} className="grid gap-2 text-sm font-medium">
              {label}
              <input
                className="rounded-md border border-black/15 px-3 py-2"
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                value={form[key as keyof typeof form]}
              />
            </label>
          ))}
        </div>
        <button className="mt-5 rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={saveBranch} type="button">
          {editingId ? "Update Branch" : "Add Branch"}
        </button>
        {message ? <p className="mt-3 text-sm font-semibold text-brand-teal">{message}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {branches.map((branch) => (
          <article key={branch.id} className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-brand-ink">{branch.name}</h2>
            <p className="mt-1 text-sm text-black/60">{branch.code}</p>
            <p className="mt-4 text-sm text-black/70">{branch.startTime} to {branch.endTime}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <span className="rounded-md bg-brand-mist p-2">{branch._count?.users ?? 0} users</span>
              <span className="rounded-md bg-brand-mist p-2">{branch._count?.vehicles ?? 0} cars</span>
              <span className="rounded-md bg-brand-mist p-2">{branch._count?.slots ?? 0} slots</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md border border-brand-teal px-3 py-2 text-sm font-semibold text-brand-teal" type="button" onClick={() => {
                setEditingId(branch.id);
                setForm({ name: branch.name, code: branch.code, address: branch.address ?? "", startTime: branch.startTime, endTime: branch.endTime });
              }}>Edit</button>
              <button className="rounded-md bg-brand-orange px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => deleteBranch(branch.id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
