"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type InternalStudent = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string;
  createdAt: string;
  branch: { name: string } | null;
  student: {
    studentCode: string;
    learningLicenseNo: string | null;
    learningLicenseDate: string | null;
    education: string | null;
    occupation: string | null;
  } | null;
};

export default function InternalLicenseWorkPage() {
  const [students, setStudents] = useState<InternalStudent[]>([]);
  const [message, setMessage] = useState("Loading internal license work...");

  async function loadStudents() {
    const token = localStorage.getItem("shiv_suman_token");
    const response = await fetch(`${apiBaseUrl}/rto/internal`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      setMessage("Unable to load internal license work. Please login again.");
      return;
    }
    const data = (await response.json()) as InternalStudent[];
    setStudents(data);
    setMessage(data.length ? "" : "No students found. Add students from the Student module first.");
  }

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <div className="grid gap-6">
      <section>
        <Link className="text-sm font-semibold text-brand-teal" href="/dashboard/rto">Back to RTO Work</Link>
        <h1 className="mt-3 text-3xl font-bold text-brand-ink">Internal License Work</h1>
        <p className="mt-2 text-black/65">Every student created from the Student module reflects here for license and RTO tracking.</p>
      </section>

      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-brand-teal text-white">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Branch</th>
              <th className="p-3">Student ID</th>
              <th className="p-3">Education</th>
              <th className="p-3">Occupation</th>
              <th className="p-3">LL Number</th>
              <th className="p-3">LL Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-brand-teal/10">
                <td className="p-3 font-semibold text-brand-ink">{student.fullName}</td>
                <td className="p-3">{student.phone ?? "-"}</td>
                <td className="p-3">{student.branch?.name ?? "-"}</td>
                <td className="p-3">{student.student?.studentCode ?? "-"}</td>
                <td className="p-3">{student.student?.education ?? "-"}</td>
                <td className="p-3">{student.student?.occupation ?? "-"}</td>
                <td className="p-3">{student.student?.learningLicenseNo ?? "Pending"}</td>
                <td className="p-3">
                  {student.student?.learningLicenseDate ? new Date(student.student.learningLicenseDate).toLocaleDateString() : "Pending"}
                </td>
                <td className="p-3">
                  <span className="rounded-md bg-brand-orange/10 px-2 py-1 text-xs font-semibold text-brand-orange">
                    {student.student?.learningLicenseNo ? "License work active" : "LL pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {message ? <p className="border-t border-brand-teal/10 p-4 text-sm font-semibold text-brand-teal">{message}</p> : null}
      </section>
    </div>
  );
}
