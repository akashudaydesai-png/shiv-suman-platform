"use client";

import { Fragment, useEffect, useState } from "react";
import { DocumentUploadPanel } from "@/components/document-upload-panel";
import { apiBaseUrl } from "@/lib/api";
import { fallbackTrainers } from "@/lib/public-fallbacks";

type User = {
  id: string;
  fullName: string;
  role: string;
  accessStatus: string;
  branch: { name: string } | null;
  staff: { id: string; employeeCode: string; designation: string } | null;
};

const staffDocumentTypes = ["PHOTO", "SIGNATURE", "THUMB", "AADHAAR", "PAN", "DRIVING_LICENSE", "POLICE_VERIFICATION", "EXPERIENCE_CERTIFICATE", "OTHER"];
const demoStaff: User[] = fallbackTrainers.map((trainer, index) => ({
  id: trainer.id,
  fullName: trainer.fullName,
  role: index === 0 ? "TRAINER" : index === 1 ? "SUPERVISOR" : "RECEPTIONIST",
  accessStatus: "ACTIVE",
  branch: trainer.branch,
  staff: { id: `staff-${trainer.id}`, employeeCode: `EMP-DEMO-${index + 1}`, designation: index === 0 ? "Senior LMV Trainer" : "Operations Staff" }
}));

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [openDocumentsFor, setOpenDocumentsFor] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("shiv_suman_token");
    if (token === "demo-vercel-session") {
      setStaff(demoStaff);
      return;
    }
    Promise.all(["TRAINER", "RECEPTIONIST", "SUPERVISOR", "BRANCH_ADMIN", "ACCOUNTANT"].map((role) =>
      fetch(`${apiBaseUrl}/users?role=${role}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.ok ? r.json() : [])
    )).then((groups) => {
      const rows = groups.flat();
      setStaff(rows.length ? rows : demoStaff);
    }).catch(() => setStaff(demoStaff));
  }, []);

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Staff</h1>
        <p className="mt-2 text-black/65">Trainer, reception, supervisor, branch admin, and accountant profiles.</p>
      </section>
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-brand-teal text-white">
            <tr><th className="p-3">Employee</th><th className="p-3">Role</th><th className="p-3">Branch</th><th className="p-3">Code</th><th className="p-3">Access</th><th className="p-3">Documents</th></tr>
          </thead>
          <tbody>
            {staff.map((employee) => (
              <Fragment key={employee.id}>
                <tr className="border-t border-brand-teal/10">
                  <td className="p-3 font-semibold text-brand-ink">{employee.fullName}</td>
                  <td className="p-3">{employee.role}</td>
                  <td className="p-3">{employee.branch?.name ?? "All branches"}</td>
                  <td className="p-3">{employee.staff?.employeeCode}</td>
                  <td className="p-3">{employee.accessStatus}</td>
                  <td className="p-3">
                    <button
                      className="rounded-md border border-brand-teal px-3 py-2 font-semibold text-brand-teal"
                      disabled={!employee.staff}
                      onClick={() => setOpenDocumentsFor((current) => current === employee.id ? null : employee.id)}
                      type="button"
                    >
                      {openDocumentsFor === employee.id ? "Close" : "Upload"}
                    </button>
                  </td>
                </tr>
                {openDocumentsFor === employee.id && employee.staff ? (
                  <tr className="border-t border-brand-teal/10">
                    <td className="p-3" colSpan={6}>
                      <DocumentUploadPanel ownerType="staff" ownerId={employee.staff.id} documentTypes={staffDocumentTypes} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
