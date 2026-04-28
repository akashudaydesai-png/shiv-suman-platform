"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type ContactPage = {
  title: string;
  seoTitle: string | null;
  metaDescription: string | null;
  contentJson: {
    summary?: string;
    content?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };
  published: boolean;
};

const emptyForm = {
  title: "Contact",
  seoTitle: "",
  metaDescription: "",
  summary: "",
  content: "",
  phone: "",
  email: "",
  whatsapp: "",
  address: "",
  ctaLabel: "",
  ctaUrl: "",
  published: true
};

export default function ContactCmsPage() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("shiv_suman_token");
    return fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers ?? {}) }
    });
  }

  async function loadContactPage() {
    const response = await authFetch("/website-admin/pages/contact");
    if (!response.ok) return;
    const page = (await response.json()) as ContactPage | null;
    if (!page) return;
    setForm({
      title: page.title ?? "Contact",
      seoTitle: page.seoTitle ?? "",
      metaDescription: page.metaDescription ?? "",
      summary: page.contentJson?.summary ?? "",
      content: page.contentJson?.content ?? "",
      phone: page.contentJson?.phone ?? "",
      email: page.contentJson?.email ?? "",
      whatsapp: page.contentJson?.whatsapp ?? "",
      address: page.contentJson?.address ?? "",
      ctaLabel: page.contentJson?.ctaLabel ?? "",
      ctaUrl: page.contentJson?.ctaUrl ?? "",
      published: page.published
    });
  }

  useEffect(() => {
    loadContactPage();
  }, []);

  async function saveContactPage() {
    setMessage("Saving contact page...");
    const response = await authFetch("/website-admin/pages/contact", {
      method: "PATCH",
      body: JSON.stringify(form)
    });
    if (!response.ok) {
      setMessage("Contact page save failed.");
      return;
    }
    setMessage("Contact page updated.");
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Contact CMS</h1>
        <p className="mt-2 text-black/65">Manage public contact page text, details, and redirect button.</p>
      </section>
      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Page title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="SEO title" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          <input className="rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Meta description" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
          <textarea className="min-h-24 rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <textarea className="min-h-32 rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Content text" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="CTA Label" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="CTA URL" value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-ink">
          <input checked={form.published} type="checkbox" onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Published on public website
        </label>
        <button className="mt-5 rounded-md bg-brand-teal px-5 py-3 font-semibold text-white" onClick={saveContactPage} type="button">
          Save Contact Page
        </button>
        {message ? <p className="mt-3 text-sm font-semibold text-brand-teal">{message}</p> : null}
      </section>
    </div>
  );
}

