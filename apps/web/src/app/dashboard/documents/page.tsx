"use client";

import Link from "next/link";
import { useState } from "react";

const documentAreas = [
  {
    title: "Student Documents",
    description: "Upload photo, signature, Aadhaar, PAN, address proof, learning license, old driving license, and other student files.",
    href: "/dashboard/students",
    action: "Open Students"
  },
  {
    title: "Staff And Trainer Documents",
    description: "Upload trainer/staff photo, signature, thumb, Aadhaar, PAN, driving license, police verification, and experience certificate.",
    href: "/dashboard/staff",
    action: "Open Staff"
  },
  {
    title: "RTO Case Documents",
    description: "RTO case document upload API is ready. The case-level upload panel will be connected after the RTO case detail screen is added.",
    href: "/dashboard/rto",
    action: "Open RTO Work"
  }
];

const formDemoData = {
  driving_school_details: {
    name: "SHIV-SUMAN MOTOR TRAINING SCHOOL",
    address: "Gala No 7, Shahu Stadium, Near Gokhale College, Subhash Road, Kolhapur",
    pincode: "416012",
    status: "Govt. Recognised"
  },
  trainee_profile: {
    enrollment_number: "11164",
    trainee_name: "Omkar Deepak Landage",
    guardian_name: "Deepak Landage",
    permanent_address: "NP 1610, Shinganapur Fata, Kolhapur, 416010",
    temporary_address: "Shinganapur, Kolhapur",
    date_of_birth: "2000-02-10",
    mobile_number: "9020727561"
  },
  training_details: {
    class_of_vehicle: "LMV(NT)",
    date_of_enrollment: "2022-02-15",
    course_period: { start_date: "2022-02-18", end_date: "2022-03-28" },
    learners_license: { number: "MH09...", expiry_date: null as string | null },
    test_details: { passing_date: "2022-05-31", driving_license_number: "MH09..." }
  },
  driving_log_form_15: [
    { date: "2022-02-18", hours_spent: "00:30", instructor_name: "A. Patil", status: "Logged" },
    { date: "2022-02-19", hours_spent: "00:30", instructor_name: "A. Patil", status: "Logged" }
  ],
  certification_form_5: {
    template_fields: [
      "trainee_name",
      "residence",
      "parentage",
      "enrollment_date",
      "form_14_serial_number",
      "vehicle_class",
      "training_start_date",
      "training_end_date",
      "physical_fitness_statement"
    ]
  }
};

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(input: string, max = 95) {
  const words = input.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function buildPdf(lines: string[]) {
  const linesPerPage = 45;
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }
  if (!pages.length) pages.push(["No data"]);

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const pageRefs: string[] = [];
  const firstDynamicObj = 4;

  pages.forEach((pageLines, pageIndex) => {
    const contentObj = firstDynamicObj + pageIndex * 2;
    const pageObj = contentObj + 1;
    pageRefs.push(`${pageObj} 0 R`);

    const streamParts = ["BT", "/F1 10 Tf", "14 TL", "40 800 Td"];
    pageLines.forEach((line, idx) => {
      streamParts.push(`(${pdfEscape(line)}) Tj`);
      if (idx !== pageLines.length - 1) streamParts.push("T*");
    });
    streamParts.push("ET");
    const stream = `${streamParts.join("\n")}\n`;

    objects.push(`${contentObj} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`);
    objects.push(`${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObj} 0 R >>\nendobj\n`);
  });

  objects.splice(1, 0, `2 0 obj\n<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pageRefs.length} >>\nendobj\n`);
  objects.splice(2, 0, "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

  let body = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(body.length);
    body += obj;
  }
  const xrefStart = body.length;
  body += `xref\n0 ${offsets.length}\n`;
  body += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([body], { type: "application/pdf" });
}

function formatForm14Lines() {
  const lines: string[] = [];
  lines.push("FORM 14 (DEMO)");
  lines.push(`Generated On: ${new Date().toLocaleString("en-IN")}`);
  lines.push("");
  lines.push("DRIVING SCHOOL DETAILS");
  lines.push(`Name: ${formDemoData.driving_school_details.name}`);
  lines.push(`Address: ${formDemoData.driving_school_details.address}`);
  lines.push(`Pincode: ${formDemoData.driving_school_details.pincode}`);
  lines.push(`Status: ${formDemoData.driving_school_details.status}`);
  lines.push("");
  lines.push("TRAINEE PROFILE");
  lines.push(`Enrollment Number: ${formDemoData.trainee_profile.enrollment_number}`);
  lines.push(`Trainee Name: ${formDemoData.trainee_profile.trainee_name}`);
  lines.push(`Guardian Name: ${formDemoData.trainee_profile.guardian_name}`);
  lines.push(`Permanent Address: ${formDemoData.trainee_profile.permanent_address}`);
  lines.push(`Temporary Address: ${formDemoData.trainee_profile.temporary_address}`);
  lines.push(`Date Of Birth: ${formDemoData.trainee_profile.date_of_birth}`);
  lines.push(`Mobile Number: ${formDemoData.trainee_profile.mobile_number}`);
  lines.push("");
  lines.push("TRAINING DETAILS");
  lines.push(`Class Of Vehicle: ${formDemoData.training_details.class_of_vehicle}`);
  lines.push(`Date Of Enrollment: ${formDemoData.training_details.date_of_enrollment}`);
  lines.push(`Course Start: ${formDemoData.training_details.course_period.start_date}`);
  lines.push(`Course End: ${formDemoData.training_details.course_period.end_date}`);
  lines.push(`Learners License Number: ${formDemoData.training_details.learners_license.number}`);
  lines.push(`Learners License Expiry: ${formDemoData.training_details.learners_license.expiry_date ?? "-"}`);
  lines.push(`Passing Date: ${formDemoData.training_details.test_details.passing_date}`);
  lines.push(`Driving License Number: ${formDemoData.training_details.test_details.driving_license_number}`);
  lines.push("");
  lines.push("FORM 14 CERTIFICATION FIELDS");
  formDemoData.certification_form_5.template_fields.forEach((field, index) => {
    lines.push(`${index + 1}. ${field}`);
  });
  lines.push("");
  lines.push("Declaration: Candidate has completed required training period under recognised school.");

  return lines.flatMap((line) => wrapText(line, 92));
}

function formatForm15Lines() {
  const lines: string[] = [];
  lines.push("FORM 15 (DEMO) - DRIVING TRAINING LOG");
  lines.push(`Generated On: ${new Date().toLocaleString("en-IN")}`);
  lines.push("");
  lines.push(`School: ${formDemoData.driving_school_details.name}`);
  lines.push(`Trainee: ${formDemoData.trainee_profile.trainee_name}`);
  lines.push(`Enrollment No: ${formDemoData.trainee_profile.enrollment_number}`);
  lines.push(`Vehicle Class: ${formDemoData.training_details.class_of_vehicle}`);
  lines.push(`Course Period: ${formDemoData.training_details.course_period.start_date} to ${formDemoData.training_details.course_period.end_date}`);
  lines.push("");
  lines.push("DAY-WISE LOG");
  lines.push("No | Date       | Hours | Instructor | Status");
  lines.push("-----------------------------------------------");
  formDemoData.driving_log_form_15.forEach((entry, index) => {
    const serial = String(index + 1).padStart(2, "0");
    const date = entry.date.padEnd(10, " ");
    const hours = (entry.hours_spent ?? "-").padEnd(5, " ");
    const instructor = (entry.instructor_name ?? "-").padEnd(10, " ");
    lines.push(`${serial} | ${date} | ${hours} | ${instructor} | ${entry.status}`);
  });
  lines.push("");
  lines.push("Trainer Signature: ____________________");
  lines.push("Trainee Signature: ____________________");
  lines.push("School Seal: __________________________");
  return lines.flatMap((line) => wrapText(line, 92));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function DocumentsPage() {
  const [message, setMessage] = useState("");

  function generateForm14Pdf() {
    const lines = formatForm14Lines();
    const pdf = buildPdf(lines);
    downloadBlob(pdf, "form-14-demo.pdf");
    setMessage("Form 14 demo PDF generated and downloaded.");
  }

  function generateForm15Pdf() {
    const lines = formatForm15Lines();
    const pdf = buildPdf(lines);
    downloadBlob(pdf, "form-15-demo.pdf");
    setMessage("Form 15 demo PDF generated and downloaded.");
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Document Upload System</h1>
        <p className="mt-2 text-black/65">Upload and view documents linked to student, staff/trainer, and RTO records.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {documentAreas.map((area) => (
          <div key={area.title} className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-brand-ink">{area.title}</h2>
            <p className="mt-3 min-h-24 text-sm text-black/65">{area.description}</p>
            <Link className="mt-4 inline-flex rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" href={area.href}>
              {area.action}
            </Link>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-brand-orange/25 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-brand-ink">Form Generators (Demo)</h2>
        <p className="mt-2 text-sm text-black/65">Form 14 and Form 15 are generated separately with different content blocks.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={generateForm14Pdf} type="button">
            Generate Form 14 PDF
          </button>
          <button className="rounded-md bg-brand-orange px-4 py-3 font-semibold text-white" onClick={generateForm15Pdf} type="button">
            Generate Form 15 PDF
          </button>
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-brand-teal">{message}</p> : null}
      </section>

      <section className="rounded-md border border-brand-orange/25 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-brand-ink">How to check</h2>
        <div className="mt-4 grid gap-3 text-sm text-black/70">
          <p>1. Click Generate Form 14 PDF and Generate Form 15 PDF separately.</p>
          <p>2. Confirm both downloaded files open in PDF viewer.</p>
          <p>3. Verify Form 14 has candidate/training/certification data and Form 15 has day-wise driving log.</p>
        </div>
      </section>
    </div>
  );
}
