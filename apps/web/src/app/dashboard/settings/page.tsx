"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type SettingRow = {
  key: string;
  value: unknown;
  updatedAt: string | null;
};

const settingSections = [
  {
    key: "branch_slot_engine",
    title: "Branch Slot Engine Controls",
    hint: "Branch open/close, break, slot duration, holiday rules, auto-rebuild slots."
  },
  {
    key: "plan_installment_templates",
    title: "Plan + Installment Rule Templates",
    hint: "Default installment structures by course type and purpose tagging."
  },
  {
    key: "automation_center",
    title: "Automation Center",
    hint: "Trigger workflows, retry policy, and failure handling."
  },
  {
    key: "role_permission_matrix",
    title: "Role Permission Matrix",
    hint: "Fine-grained role visibility and branch-scoped toggles."
  },
  {
    key: "messaging_templates",
    title: "Messaging Templates",
    hint: "WhatsApp/SMS/Email templates with EN/MR/HI language variants."
  },
  {
    key: "document_compliance",
    title: "Document Compliance Settings",
    hint: "Required docs and hard-block rules before stage transitions."
  },
  {
    key: "evidence_privacy_policy",
    title: "Evidence & Privacy Policy",
    hint: "Fleet/camera retention, access control, downloads, watermark."
  },
  {
    key: "financial_controls",
    title: "Financial Controls",
    hint: "Receipt format, refund approval flow, one-time/installment rules."
  },
  {
    key: "rto_service_catalog",
    title: "RTO Service Catalog",
    hint: "Dynamic RTO form behavior, fee structure, documents, SLA states."
  },
  {
    key: "audit_alert_rules",
    title: "Audit + Alert Rules",
    hint: "Critical alerts for timing change, missed sessions, approvals, webhook failures."
  }
] as const;

type SettingsKey = (typeof settingSections)[number]["key"];

function prettyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingKey, setSavingKey] = useState<string>("");
  const [rows, setRows] = useState<Record<string, { text: string; updatedAt: string | null }>>({});

  async function loadSettings() {
    setLoading(true);
    setMessage("");
    const token = localStorage.getItem("shiv_suman_token");
    const response = await fetch(`${apiBaseUrl}/settings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!response.ok) {
      setLoading(false);
      setMessage("Settings load failed.");
      return;
    }
    const data = await response.json() as SettingRow[];
    const nextRows: Record<string, { text: string; updatedAt: string | null }> = {};
    data.forEach((row) => {
      nextRows[row.key] = { text: prettyJson(row.value), updatedAt: row.updatedAt };
    });
    setRows(nextRows);
    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateText(key: string, value: string) {
    setRows((current) => ({
      ...current,
      [key]: { text: value, updatedAt: current[key]?.updatedAt ?? null }
    }));
  }

  async function saveOne(key: SettingsKey) {
    const currentText = rows[key]?.text ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(currentText);
    } catch {
      setMessage(`${key}: invalid JSON format.`);
      return;
    }

    setSavingKey(key);
    setMessage("");
    const token = localStorage.getItem("shiv_suman_token");
    const response = await fetch(`${apiBaseUrl}/settings/${key}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ value: parsed })
    });
    setSavingKey("");
    if (!response.ok) {
      setMessage(`${key}: save failed.`);
      return;
    }

    const saved = await response.json() as { key: string; value: unknown; updatedAt: string };
    setRows((current) => ({
      ...current,
      [key]: {
        text: prettyJson(saved.value),
        updatedAt: saved.updatedAt
      }
    }));
    setMessage(`${key}: saved.`);
  }

  const sections = useMemo(
    () =>
      settingSections.map((section) => ({
        ...section,
        text: rows[section.key]?.text ?? "{}",
        updatedAt: rows[section.key]?.updatedAt ?? null
      })),
    [rows]
  );

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Dynamic Settings Control Center</h1>
        <p className="mt-2 text-black/65">All core business rules are editable here and saved to database in real-time config format.</p>
      </section>

      {message ? <p className="rounded-md border border-brand-teal/20 bg-brand-mist px-4 py-3 text-sm font-semibold text-brand-teal">{message}</p> : null}
      {loading ? <p className="text-sm font-semibold text-brand-teal">Loading settings...</p> : null}

      <section className="grid gap-4">
        {sections.map((section) => (
          <article className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft" key={section.key}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-brand-ink">{section.title}</h2>
                <p className="mt-1 text-sm text-black/60">{section.hint}</p>
              </div>
              <button
                className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/25"
                disabled={savingKey === section.key}
                onClick={() => void saveOne(section.key)}
                type="button"
              >
                {savingKey === section.key ? "Saving..." : "Save Section"}
              </button>
            </div>
            <textarea
              className="mt-4 min-h-[220px] w-full rounded-md border border-black/15 px-3 py-3 font-mono text-sm"
              onChange={(event) => updateText(section.key, event.target.value)}
              value={section.text}
            />
            <p className="mt-2 text-xs text-black/55">
              Key: <span className="font-semibold">{section.key}</span>
              {section.updatedAt ? ` | Last updated: ${new Date(section.updatedAt).toLocaleString("en-IN")}` : " | Not saved yet"}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
