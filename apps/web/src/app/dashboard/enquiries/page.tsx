"use client";

import { useEffect, useState } from "react";
import { EnquiryForm } from "@/app/enquiry/enquiry-form";
import { apiBaseUrl } from "@/lib/api";

type Enquiry = {
  id: string;
  enquiryCode?: string;
  fullName: string;
  phone: string;
  email: string | null;
  source: string;
  type: string;
  preferredSlotId: string | null;
  courseOrService: string | null;
  status: string;
  createdAt: string;
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function loadEnquiries() {
    const token = localStorage.getItem("shiv_suman_token");
    const response = await fetch(`${apiBaseUrl}/enquiries`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) setEnquiries(await response.json());
  }

  useEffect(() => {
    loadEnquiries();
  }, []);

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Enquiries</h1>
        <p className="mt-2 text-black/65">Admin and reception use this same enquiry form. Website enquiries also appear here.</p>
      </section>
      <section>
        <button className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={() => setShowForm((value) => !value)} type="button">
          {showForm ? "Close Form" : "Add Enquiry"}
        </button>
      </section>
      {showForm ? <EnquiryForm mode="dashboard" onSubmitted={() => { loadEnquiries(); setShowForm(false); }} /> : null}
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-brand-teal text-white">
            <tr>
              <th className="p-3">Enquiry ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Enquiry Date</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Source</th>
              <th className="p-3">Type</th>
              <th className="p-3">Preferred Slot</th>
              <th className="p-3">Plan / Service</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="border-t border-brand-teal/10">
                <td className="p-3 font-semibold text-brand-teal">{enquiry.enquiryCode ?? enquiry.id.slice(0, 7).toUpperCase()}</td>
                <td className="p-3 font-semibold text-brand-ink">{enquiry.fullName}</td>
                <td className="p-3">{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{enquiry.phone}</td>
                <td className="p-3">{enquiry.source}</td>
                <td className="p-3">{enquiry.type}</td>
                <td className="p-3">{enquiry.preferredSlotId ?? "-"}</td>
                <td className="p-3">{enquiry.courseOrService ?? "-"}</td>
                <td className="p-3">{enquiry.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
