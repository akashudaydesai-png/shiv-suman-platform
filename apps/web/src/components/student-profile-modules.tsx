"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type StudentModule = {
  key: StudentProfileTabKey;
  title: string;
  description: string;
};

export type StudentProfileTabKey =
  | "personal-info"
  | "attendance"
  | "video-lectures"
  | "test-result"
  | "feedback-student"
  | "trainer-feedback"
  | "training-recording"
  | "tracker-data";

type ModuleRecord = {
  day: number;
  data: Record<string, unknown>;
  updatedAt: string;
};

type TrainingSessionRow = {
  id: string;
  day: number;
  date: string;
  startsAt: string;
  endsAt: string | null;
  durationMinutes: number;
  status: string;
  vehicleName: string;
  vehicleNo: string;
  fleetTripId: string | null;
  recordingId: string | null;
};

type StudentProfileForForms = {
  fullName: string;
  student?: {
    studentCode: string;
    relationName: string | null;
    addressJson?: Record<string, string> | null;
    dateOfBirth?: string | null;
    learningLicenseNo?: string | null;
    learningLicenseDate?: string | null;
    learningLicenseValidity?: string | null;
    photoUrl?: string | null;
    documents?: Array<{ type: string; fileUrl: string }>;
    admissions?: Array<{ createdAt: string; planId: string }>;
  } | null;
  plans?: Array<{ id: string; durationDays: number }>;
};

const moduleCards: StudentModule[] = [
  { key: "personal-info", title: "Personal Info", description: "Profile, documents, payments, and course details." },
  { key: "attendance", title: "Attendance", description: "15-day government training register format." },
  { key: "video-lectures", title: "Video Lectures", description: "Seen and pending lessons based on selected course days." },
  { key: "test-result", title: "Test Result", description: "Daily test marks, pass status, and total score." },
  { key: "feedback-student", title: "Feedback Student", description: "Student learning and mistake self-report day wise." },
  { key: "trainer-feedback", title: "Trainer Feedback", description: "Trainer notes, mistakes, and teaching record day wise." },
  { key: "training-recording", title: "Training Recording", description: "Day-wise camera clips from training cars." },
  { key: "tracker-data", title: "Tracker / Data of Car", description: "Daily route and driver behavior records." }
];

const quizDefaults = { marks: "", maxMarks: "20", result: "Pending" };
const attendanceDefaults = { inTime: "", outTime: "", vehicleNo: "", classType: "LMV", trainer: "", topic: "", status: "Present", studentSign: "" };
const videoLectureDefaults = { lectureTitle: "", durationMin: "", status: "Pending", watchedAt: "" };
const trainerFeedbackDefaults = { trainerName: "", taughtToday: "", mistakes: "", action: "" };
const studentFeedbackDefaults = { learnedToday: "", selectedMistake: "", confidence: "3" };
const fleetDeviceDefaults = { route: "", distanceKm: "", avgSpeed: "", behavior: "", remark: "" };
const carCameraDefaults = { cameraType: "Front + Cabin", status: "Pending", note: "" };

function moduleBase(studentId: string) {
  return `/dashboard/students/${studentId}`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString("en-IN");
}

function authHeaders() {
  const token = localStorage.getItem("shiv_suman_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

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

function formatDdMmYyyy(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

const apiOrigin = apiBaseUrl.replace(/\/api$/, "");

function resolveAssetUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path}`;
}

function addDays(value: Date, dayCount: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + dayCount);
  return next;
}

function formatAddress(address?: Record<string, string> | null) {
  if (!address) return "-";
  return [address.addressLine1, address.addressLine2, address.tehsil, address.district, address.state, address.pincode]
    .filter((item) => Boolean(item && item.trim()))
    .join(", ") || "-";
}

function openPrintableWindow(title: string, htmlBody: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.srcdoc = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #101820; }
          .page { padding: 28px 34px; max-width: 760px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; }
          .heading { font-size: 26px; font-weight: 700; margin-bottom: 2px; }
          .school { font-size: 13px; font-weight: 600; color: #005f63; margin-top: 6px; }
          .photo-box { width: 120px; height: 140px; border: 1px solid #8b8b8b; border-radius: 4px; overflow: hidden; background: #f7f7f7; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 11px; text-align: center; }
          .photo-box img { width: 100%; height: 100%; object-fit: cover; }
          .section { margin-top: 18px; }
          .table { width: 100%; border-collapse: collapse; }
          .table td, .table th { border: 1px solid #d4d4d8; padding: 8px 10px; font-size: 12px; vertical-align: top; }
          .table th { text-align: left; background: #f2f6f7; font-weight: 700; }
          .muted { color: #6b7280; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { max-width: 100%; }
          }
        </style>
      </head>
      <body>${htmlBody}</body>
    </html>
  `;
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => {
      iframe.remove();
    }, 1200);
  };

  iframe.onload = () => {
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      cleanup();
      return;
    }
    frameWindow.focus();
    frameWindow.print();
    cleanup();
  };

  return true;
}

function useModuleData(studentId: string, moduleKey: string, totalDays: number, defaults: Record<string, string>) {
  const [rows, setRows] = useState<Record<number, Record<string, string>>>({});
  const [message, setMessage] = useState("");
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setMessage("");
      const response = await fetch(`${apiBaseUrl}/student-modules/${studentId}/${moduleKey}`, {
        headers: authHeaders(),
        cache: "no-store"
      });
      if (!mounted) return;
      if (!response.ok) {
        const fallbackRows: Record<number, Record<string, string>> = {};
        for (let day = 1; day <= totalDays; day += 1) fallbackRows[day] = { ...defaults };
        setRows(fallbackRows);
        setLoading(false);
        return;
      }

      const records = await response.json() as ModuleRecord[];
      const byDay = new Map(records.map((record) => [record.day, record]));
      const nextRows: Record<number, Record<string, string>> = {};
      for (let day = 1; day <= totalDays; day += 1) {
        const record = byDay.get(day);
        const values: Record<string, string> = { ...defaults };
        if (record?.data) {
          Object.entries(record.data).forEach(([key, value]) => {
            values[key] = value === null || value === undefined ? "" : String(value);
          });
        }
        nextRows[day] = values;
      }
      setRows(nextRows);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [defaults, moduleKey, studentId, totalDays]);

  function updateCell(day: number, key: string, value: string) {
    setRows((current) => ({
      ...current,
      [day]: { ...(current[day] ?? defaults), [key]: value }
    }));
  }

  async function saveDay(day: number) {
    const row = rows[day] ?? defaults;
    setSavingDay(day);
    setMessage("");
    const response = await fetch(`${apiBaseUrl}/student-modules/${studentId}/${moduleKey}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ day, data: row })
    });
    setSavingDay(null);
    if (!response.ok) {
      setMessage(`Day ${day} save failed.`);
      return;
    }
    setMessage(`Day ${day} saved.`);
  }

  return { rows, loading, message, savingDay, updateCell, saveDay };
}

function useTrainingSessions(studentId: string) {
  const [sessions, setSessions] = useState<TrainingSessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/student-modules/${studentId}/sessions/list`, {
        headers: authHeaders(),
        cache: "no-store"
      });
      if (!mounted) return;
      if (!response.ok) {
        setSessions([]);
        setLoading(false);
        return;
      }
      setSessions(await response.json());
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  return { sessions, loading };
}

export function StudentProfileTabs({
  activeTab,
  onChange
}: {
  activeTab: StudentProfileTabKey;
  onChange: (tab: StudentProfileTabKey) => void;
}) {
  return (
    <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-ink">Student Profile Sections</h2>
          <p className="mt-2 text-sm text-black/65">Switch between the student record sections without leaving this profile page.</p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-max gap-6 border-b border-brand-teal/15">
        {moduleCards.map((card) => (
          <button
            className={`relative whitespace-nowrap border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition ${
              activeTab === card.key
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-black/55 hover:border-brand-teal/35 hover:text-brand-ink"
            }`}
            key={card.key}
            onClick={() => onChange(card.key)}
            type="button"
          >
            {card.title}
          </button>
        ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {moduleCards.map((card) => (
          <span
            className={`rounded-md px-2 py-1 text-xs ${
              activeTab === card.key ? "bg-brand-mist text-brand-teal" : "bg-black/5 text-black/50"
            }`}
            key={`${card.key}-hint`}
          >
            {card.description}
          </span>
        ))}
      </div>
    </section>
  );
}

export function StudentProfilePageHeader({
  studentId,
  title,
  description,
  embedded = false
}: {
  studentId: string;
  title: string;
  description: string;
  embedded?: boolean;
}) {
  return (
    <section className="grid gap-3">
      {!embedded ? (
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link className="text-brand-teal" href="/dashboard/students">Back to Students</Link>
          <Link className="text-brand-teal" href={moduleBase(studentId)}>Back to Profile</Link>
        </div>
      ) : null}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-orange">Student record</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-ink">{title}</h1>
        <p className="mt-2 text-black/65">{description}</p>
      </div>
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-brand-teal/20 bg-white p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase text-black/45">{label}</p>
      <p className="mt-2 text-2xl font-bold text-brand-teal">{value}</p>
    </div>
  );
}

function DayDate({ day }: { day: number }) {
  const current = new Date();
  const date = new Date(current.getFullYear(), current.getMonth(), day);
  return <>{date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</>;
}

export function QuizMarksPage({ studentId, embedded = false }: { studentId: string; embedded?: boolean }) {
  const { rows, loading, message, savingDay, updateCell, saveDay } = useModuleData(studentId, "quiz", 26, quizDefaults);

  const totals = useMemo(() => {
    let total = 0;
    let max = 0;
    let completed = 0;
    for (let day = 1; day <= 26; day += 1) {
      const marks = toNumber(rows[day]?.marks ?? "0");
      const maxMarks = toNumber(rows[day]?.maxMarks ?? "20");
      total += marks;
      max += maxMarks;
      if (rows[day]?.marks) completed += 1;
    }
    return { total, max, completed };
  }, [rows]);

  return (
    <div className="grid gap-6">
      <StudentProfilePageHeader embedded={embedded} studentId={studentId} title="Test Result" description="Daily quiz marks, pass/review status, and total score." />
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile label="Completed Days" value={`${totals.completed}/26`} />
        <SummaryTile label="Total Marks" value={`${totals.total}/${totals.max || 520}`} />
        <SummaryTile label="Average" value={totals.completed ? `${Math.round(totals.total / totals.completed)}` : "0"} />
      </div>
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-brand-teal text-white">
              <tr><th className="p-3">Day</th><th className="p-3">Date</th><th className="p-3">Marks</th><th className="p-3">Max</th><th className="p-3">Result</th><th className="p-3">Action</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: 26 }, (_, index) => index + 1).map((day) => (
                <tr className="border-t border-brand-teal/10" key={day}>
                  <td className="p-3 font-semibold text-brand-ink">{day}</td>
                  <td className="p-3 text-black/65"><DayDate day={day} /></td>
                  <td className="p-3"><input className="w-24 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.marks ?? ""} onChange={(e) => updateCell(day, "marks", e.target.value.replace(/[^0-9]/g, ""))} /></td>
                  <td className="p-3"><input className="w-24 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.maxMarks ?? "20"} onChange={(e) => updateCell(day, "maxMarks", e.target.value.replace(/[^0-9]/g, ""))} /></td>
                  <td className="p-3">
                    <select className="rounded-md border border-black/15 px-2 py-1" value={rows[day]?.result ?? "Pending"} onChange={(e) => updateCell(day, "result", e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Pass">Pass</option>
                      <option value="Review">Review</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </td>
                  <td className="p-3"><button className="rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white" onClick={() => saveDay(day)} type="button">{savingDay === day ? "Saving..." : "Save"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {loading ? <p className="text-sm text-black/60">Loading...</p> : null}
      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
    </div>
  );
}

export function AttendanceRegisterPage({
  studentId,
  embedded = false,
  totalDays = 15
}: {
  studentId: string;
  embedded?: boolean;
  totalDays?: number;
}) {
  const { rows, loading, message, savingDay, updateCell, saveDay } = useModuleData(studentId, "attendance", totalDays, attendanceDefaults);
  const [formMessage, setFormMessage] = useState("");
  const [activeFormPreview, setActiveFormPreview] = useState<"form14" | "form15" | "form5">("form14");
  const [certificateRemark, setCertificateRemark] = useState<"EXCELLENT" | "GOOD" | "POOR_NEED_MORE_TRAINING">("GOOD");
  const [studentProfile, setStudentProfile] = useState<StudentProfileForForms | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadStudent() {
      const response = await fetch(`${apiBaseUrl}/users/${studentId}`, {
        headers: authHeaders(),
        cache: "no-store"
      });
      if (!mounted) return;
      if (!response.ok) {
        setStudentProfile(null);
        return;
      }
      setStudentProfile(await response.json());
    }
    loadStudent();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  const presentCount = useMemo(
    () => Array.from({ length: totalDays }, (_, index) => index + 1).filter((day) => (rows[day]?.status ?? "") === "Present").length,
    [rows, totalDays]
  );

  const admission = studentProfile?.student?.admissions?.[0];
  const matchedPlan = studentProfile?.plans?.find((plan) => plan.id === admission?.planId);
  const enrollmentDate = admission?.createdAt ? new Date(admission.createdAt) : new Date();
  const endDate = addDays(enrollmentDate, matchedPlan?.durationDays ?? totalDays);
  const address = studentProfile?.student?.addressJson ?? {};
  const photoPath = studentProfile?.student?.photoUrl || studentProfile?.student?.documents?.find((doc) => doc.type === "PHOTO")?.fileUrl || "";
  const photoUrl = resolveAssetUrl(photoPath);
  const logoUrl = "/logo.jpeg";
  const vehicleClass = rows[1]?.classType || "LMV(NT)";
  const permanentAddress = formatAddress(address);
  const officialAddress = [address.tehsil, address.district].filter(Boolean).join(", ") || "-";
  const remarkLabel = certificateRemark === "EXCELLENT" ? "Excellent" : certificateRemark === "GOOD" ? "Good" : "Poor - Need More Training";
  const form15Rows = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const row = rows[day] ?? attendanceDefaults;
    const logDate = formatDdMmYyyy(addDays(enrollmentDate, day - 1).toISOString());
    return {
      day,
      logDate,
      hours: row.inTime && row.outTime ? `${row.inTime} to ${row.outTime}` : "[Pending Log]",
      instructor: row.trainer || "[Manual Entry]",
      sign: row.studentSign || "Signed"
    };
  });

  function printCompletionCertificate() {
    if (!studentProfile?.student) {
      setFormMessage("Student profile data not loaded yet.");
      return;
    }
    const printableLogo = `${window.location.origin}/logo.jpeg`;
    const html = `
      <div class="page" style="max-width:980px;padding:34px;border:8px solid #0b8b8f;background:#ffffff;">
        <div style="border:2px solid #f59e0b;padding:28px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <img src="${printableLogo}" alt="Shiv Suman Logo" style="height:64px;object-fit:contain;" />
              <div>
                <div style="font-size:24px;font-weight:800;color:#0b8b8f;">SHIV SUMAN</div>
                <div style="font-size:14px;font-weight:700;color:#f59e0b;">Motor Training School</div>
              </div>
            </div>
            <div style="font-size:13px;color:#0f172a;">Certificate No: ${studentProfile.student.studentCode || "-"}</div>
          </div>
          <div style="margin-top:26px;text-align:center;">
            <div style="font-size:34px;font-weight:800;color:#0b8b8f;letter-spacing:1px;">COURSE COMPLETION CERTIFICATE</div>
            <div style="margin-top:10px;font-size:15px;color:#334155;">This is to certify that</div>
            <div style="margin-top:14px;font-size:33px;font-weight:800;color:#0f172a;">${studentProfile.fullName || "-"}</div>
            <div style="margin-top:10px;font-size:15px;color:#334155;">Student ID: ${studentProfile.student.studentCode || "-"}</div>
          </div>
          <div style="margin-top:22px;line-height:1.75;font-size:15px;color:#111827;">
            has successfully completed practical training for
            <span style="font-weight:700;color:#0b8b8f;"> ${vehicleClass}</span>
            from
            <span style="font-weight:700;"> ${formatDdMmYyyy(enrollmentDate.toISOString())}</span>
            to
            <span style="font-weight:700;"> ${formatDdMmYyyy(endDate.toISOString())}</span>
            at Shiv Suman Motor Training School.
          </div>
          <div style="margin-top:14px;line-height:1.7;font-size:14px;color:#334155;">
            Remark: <span style="font-weight:700;color:#0b8b8f;">${remarkLabel}</span>
          </div>
          <div style="margin-top:34px;display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="text-align:center;">
              <div style="border-top:1px solid #64748b;padding-top:7px;width:180px;font-size:12px;color:#334155;">Date</div>
              <div style="margin-top:5px;font-weight:700;">${formatDdMmYyyy(new Date().toISOString())}</div>
            </div>
            <div style="text-align:center;">
              <div style="border-top:1px solid #64748b;padding-top:7px;width:220px;font-size:12px;color:#334155;">Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    `;
    const opened = openPrintableWindow(`Course Certificate - ${studentProfile.student.studentCode || studentId}`, html);
    setFormMessage(opened ? "Certificate opened in print view." : "Popup blocked. Please allow popups and try again.");
  }

  function printForm15() {
    if (!studentProfile?.student) {
      setFormMessage("Student profile data not loaded yet.");
      return;
    }
    const rowHtml = form15Rows
      .map(
        (item) => `
          <tr>
            <td>${item.day}</td>
            <td>${item.logDate}</td>
            <td>${item.hours}</td>
            <td>${item.instructor}</td>
            <td>${item.sign}</td>
          </tr>
        `
      )
      .join("");
    const printableLogo = `${window.location.origin}/logo.jpeg`;
    const html = `
      <div class="page" style="max-width:980px;padding:28px;background:#fff;">
        <div style="border:2px solid #0b8b8f;padding:18px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #d1d5db;padding-bottom:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <img src="${printableLogo}" alt="Shiv Suman Logo" style="height:46px;object-fit:contain;" />
              <div>
                <div style="font-size:22px;font-weight:800;color:#0b8b8f;">Form 15</div>
                <div style="font-size:13px;font-weight:700;color:#f59e0b;">Driving Practice Log Register</div>
              </div>
            </div>
            <div style="font-size:12px;color:#334155;">Student ID: ${studentProfile.student.studentCode || "-"}</div>
          </div>
          <div style="margin-top:10px;font-size:13px;color:#111827;line-height:1.6;">
            <b>Trainee Name:</b> ${studentProfile.fullName || "-"}<br />
            <b>Vehicle Class:</b> ${vehicleClass}<br />
            <b>Course Duration:</b> ${formatDdMmYyyy(enrollmentDate.toISOString())} to ${formatDdMmYyyy(endDate.toISOString())}
          </div>
          <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:12px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="border:1px solid #d1d5db;padding:7px;text-align:left;">Day</th>
                <th style="border:1px solid #d1d5db;padding:7px;text-align:left;">Log Date</th>
                <th style="border:1px solid #d1d5db;padding:7px;text-align:left;">Hours (From - To)</th>
                <th style="border:1px solid #d1d5db;padding:7px;text-align:left;">Instructor Name</th>
                <th style="border:1px solid #d1d5db;padding:7px;text-align:left;">Trainee Signature</th>
              </tr>
            </thead>
            <tbody>${rowHtml}</tbody>
          </table>
        </div>
      </div>
    `;
    const opened = openPrintableWindow(`Form 15 - ${studentProfile.student.studentCode || studentId}`, html);
    setFormMessage(opened ? "Form 15 opened in print view." : "Popup blocked. Please allow popups and try again.");
  }

  function printForm14() {
    if (!studentProfile?.student) {
      setFormMessage("Student profile data not loaded yet.");
      return;
    }
    const printableLogo = `${window.location.origin}/logo.jpeg`;
    const html = `
      <div class="page" style="max-width:980px;padding:28px;background:#fff;">
        <div style="border:2px solid #0b8b8f;padding:18px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;border-bottom:1px solid #d1d5db;padding-bottom:10px;">
            <div>
              <div style="display:flex;align-items:center;gap:10px;">
                <img src="${printableLogo}" alt="Shiv Suman Logo" style="height:46px;object-fit:contain;" />
                <div>
                  <div style="font-size:24px;font-weight:800;color:#0b8b8f;">Form 14</div>
                  <div style="font-size:13px;font-weight:700;color:#f59e0b;">SHIV - SUMAN MOTOR TRAINING SCHOOL</div>
                </div>
              </div>
            </div>
            <div style="width:108px;height:130px;border:1px solid #94a3b8;border-radius:4px;overflow:hidden;background:#f8fafc;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:11px;">
              ${photoUrl ? `<img src="${photoUrl}" alt="Student photo" style="width:100%;height:100%;object-fit:cover;" />` : "PHOTO"}
            </div>
          </div>
          <div style="margin-top:12px;font-size:13px;color:#111827;line-height:1.75;">
            <div><b>School Name:</b> SHIV - SUMAN MOTOR TRAINING SCHOOL</div>
            <div><b>Enrolment Number:</b> ${studentProfile.student.studentCode || "-"}</div>
            <div><b>Register Year:</b> ${String(enrollmentDate.getFullYear())}</div>
            <div><b>Trainee Name:</b> ${studentProfile.fullName || "-"}</div>
            <div><b>Permanent Address:</b> ${permanentAddress}</div>
            <div><b>Official/Temp Address:</b> ${officialAddress}</div>
            <div><b>Date of Birth:</b> ${formatDdMmYyyy(studentProfile.student.dateOfBirth)}</div>
            <div><b>Date of Enrolment:</b> ${formatDdMmYyyy(admission?.createdAt)}</div>
            <div><b>Vehicle Class:</b> ${vehicleClass}</div>
            <div><b>Learner's License No.:</b> ${studentProfile.student.learningLicenseNo || "-"}</div>
            <div><b>Course Duration:</b> ${formatDdMmYyyy(enrollmentDate.toISOString())} to ${formatDdMmYyyy(endDate.toISOString())}</div>
            <div><b>Test Passing Date:</b> -</div>
            <div><b>Driving License No.:</b> -</div>
          </div>
        </div>
      </div>
    `;
    const opened = openPrintableWindow(`Form 14 - ${studentProfile.student.studentCode || studentId}`, html);
    setFormMessage(opened ? "Form 14 opened in print view." : "Popup blocked. Please allow popups and try again.");
  }

  return (
    <div className="grid gap-6">
      <StudentProfilePageHeader embedded={embedded} studentId={studentId} title="Attendance" description={`${totalDays}-day practical register format for government/RTO audit.`} />
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryTile label="Training Days" value={`${totalDays}`} />
        <SummaryTile label="Present" value={`${presentCount}`} />
        <SummaryTile label="Absent" value={`${totalDays - presentCount}`} />
        <SummaryTile label="Format" value="Gov Register" />
      </div>
      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-md border border-brand-teal px-4 py-2 text-sm font-semibold text-brand-teal"
            onClick={() => setActiveFormPreview("form14")}
            type="button"
          >
            Preview Form 14
          </button>
          <button
            className="rounded-md border border-brand-teal px-4 py-2 text-sm font-semibold text-brand-teal"
            onClick={() => setActiveFormPreview("form15")}
            type="button"
          >
            Preview Form 15
          </button>
          <button
            className="rounded-md border border-brand-teal px-4 py-2 text-sm font-semibold text-brand-teal"
            onClick={() => setActiveFormPreview("form5")}
            type="button"
          >
            Preview Form 5
          </button>
        </div>
        {formMessage ? <p className="mt-3 text-sm font-semibold text-brand-teal">{formMessage}</p> : null}
      </section>
      <section className="rounded-md border border-brand-orange/25 bg-white p-5 shadow-soft">
        {activeFormPreview === "form14" ? (
          <div className="mx-auto max-w-[920px] rounded-md border border-black/10 p-6">
            <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-4">
              <div className="flex items-center gap-3">
                <img alt="Shiv Suman Logo" className="h-10 w-auto" src={logoUrl} />
                <div>
                  <p className="text-2xl font-bold text-brand-ink">Form 14</p>
                  <p className="mt-1 text-sm font-semibold text-brand-teal">SHIV - SUMAN MOTOR TRAINING SCHOOL</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <button className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white" onClick={printForm14} type="button">
                  Print Form 14
                </button>
                <div className="h-32 w-28 overflow-hidden rounded-md border border-black/20 bg-black/5">
                  {photoUrl ? <img alt="Student photo" className="h-full w-full object-cover" src={photoUrl} /> : <div className="flex h-full items-center justify-center text-xs text-black/50">PHOTO</div>}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-brand-ink">
              <p><span className="font-semibold">School Name:</span> SHIV - SUMAN MOTOR TRAINING SCHOOL</p>
              <p><span className="font-semibold">Enrolment Number:</span> {studentProfile?.student?.studentCode || "-"}</p>
              <p><span className="font-semibold">Register Year:</span> {String(enrollmentDate.getFullYear())}</p>
              <p><span className="font-semibold">Trainee Name:</span> {studentProfile?.fullName || "-"}</p>
              <p><span className="font-semibold">Permanent Address:</span> {permanentAddress}</p>
              <p><span className="font-semibold">Official/Temp Address:</span> {officialAddress}</p>
              <p><span className="font-semibold">Date of Birth:</span> {formatDdMmYyyy(studentProfile?.student?.dateOfBirth)}</p>
              <p><span className="font-semibold">Date of Enrolment:</span> {formatDdMmYyyy(admission?.createdAt)}</p>
              <p><span className="font-semibold">Vehicle Class:</span> {vehicleClass}</p>
              <p><span className="font-semibold">Learner&apos;s License No.:</span> {studentProfile?.student?.learningLicenseNo || "-"}</p>
              <p><span className="font-semibold">Course Duration:</span> {formatDdMmYyyy(enrollmentDate.toISOString())} to {formatDdMmYyyy(endDate.toISOString())}</p>
              <p><span className="font-semibold">Test Passing Date:</span> -</p>
              <p><span className="font-semibold">Driving License No.:</span> -</p>
            </div>
          </div>
        ) : activeFormPreview === "form15" ? (
          <div className="mx-auto max-w-[980px] rounded-md border border-brand-teal/25 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
              <div className="flex items-center gap-3">
                <img alt="Shiv Suman Logo" className="h-10 w-auto" src={logoUrl} />
                <div>
                  <p className="text-2xl font-bold text-brand-ink">Form 15</p>
                  <p className="mt-1 text-sm font-semibold text-brand-teal">Driving Practice Log Register</p>
                </div>
              </div>
              <button className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white" onClick={printForm15} type="button">
                Print Form 15
              </button>
            </div>
            <div className="mt-4 grid gap-2 rounded-md bg-brand-mist/35 p-4 text-sm text-brand-ink md:grid-cols-3">
              <p><span className="font-semibold">Student:</span> {studentProfile?.fullName || "-"}</p>
              <p><span className="font-semibold">Student ID:</span> {studentProfile?.student?.studentCode || "-"}</p>
              <p><span className="font-semibold">Vehicle Class:</span> {vehicleClass}</p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-brand-teal text-white">
                  <tr>
                    <th className="p-3">Day</th>
                    <th className="p-3">Log Date</th>
                    <th className="p-3">Hours (From - To)</th>
                    <th className="p-3">Instructor Name</th>
                    <th className="p-3">Trainee Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {form15Rows.map((item) => (
                    <tr className="border-t border-brand-teal/15" key={`form15-${item.day}`}>
                      <td className="p-3 font-semibold text-brand-ink">{item.day}</td>
                      <td className="p-3">{item.logDate}</td>
                      <td className="p-3">{item.hours}</td>
                      <td className="p-3">{item.instructor}</td>
                      <td className="p-3">{item.sign}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[980px] rounded-lg border-4 border-brand-teal bg-white p-5 md:p-8">
            <div className="rounded-md border-2 border-brand-orange/70 p-5 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img alt="Shiv Suman Logo" className="h-12 w-auto md:h-16" src={logoUrl} />
                  <div>
                    <p className="text-2xl font-extrabold tracking-wide text-brand-teal">SHIV SUMAN</p>
                    <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">Motor Training School</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-black/70">Certificate No: {studentProfile?.student?.studentCode || "-"}</p>
              </div>

              <div className="mt-7 text-center">
                <p className="text-3xl font-extrabold tracking-wide text-brand-teal md:text-5xl">COURSE COMPLETION CERTIFICATE</p>
                <p className="mt-4 text-sm font-medium text-black/70">This is to certify that</p>
                <p className="mt-3 text-3xl font-extrabold text-brand-ink md:text-5xl">{studentProfile?.fullName || "-"}</p>
                <p className="mt-2 text-sm font-semibold text-black/65">Student ID: {studentProfile?.student?.studentCode || "-"}</p>
              </div>

              <p className="mx-auto mt-7 max-w-[760px] text-center text-base leading-8 text-black/85 md:text-lg">
                has successfully completed practical training for <span className="font-extrabold text-brand-teal">{vehicleClass}</span> from{" "}
                <span className="font-bold">{formatDdMmYyyy(enrollmentDate.toISOString())}</span> to{" "}
                <span className="font-bold">{formatDdMmYyyy(endDate.toISOString())}</span> at Shiv Suman Motor Training School.
              </p>

              <div className="mx-auto mt-5 max-w-[760px] rounded-md bg-brand-mist/40 p-4 text-sm text-brand-ink">
                <p className="font-semibold">Remark</p>
                <select
                  className="mt-2 w-full rounded-md border border-black/15 bg-white px-3 py-2"
                  onChange={(event) => setCertificateRemark(event.target.value as "EXCELLENT" | "GOOD" | "POOR_NEED_MORE_TRAINING")}
                  value={certificateRemark}
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="POOR_NEED_MORE_TRAINING">Poor - Need More Training</option>
                </select>
              </div>

              <div className="mt-10 flex flex-wrap justify-between gap-8">
                <div className="w-44 text-center">
                  <div className="border-t border-black/40 pt-2 text-xs font-semibold uppercase text-black/60">Date</div>
                  <div className="mt-1 text-sm font-bold text-brand-ink">{formatDdMmYyyy(new Date().toISOString())}</div>
                </div>
                <div className="w-56 text-center">
                  <div className="border-t border-black/40 pt-2 text-xs font-semibold uppercase text-black/60">Authorized Signatory</div>
                </div>
              </div>

              <div className="mt-6">
                <button className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white" onClick={printCompletionCertificate} type="button">
                  Print Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1260px] border-collapse text-left text-sm">
            <thead className="bg-brand-teal text-white">
              <tr>
                <th className="p-3">Day</th><th className="p-3">Date</th><th className="p-3">In</th><th className="p-3">Out</th><th className="p-3">Vehicle No.</th><th className="p-3">Class</th><th className="p-3">Trainer</th><th className="p-3">Topic</th><th className="p-3">Status</th><th className="p-3">Student Sign</th><th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => (
                <tr className="border-t border-brand-teal/10" key={day}>
                  <td className="p-3 font-semibold text-brand-ink">{day}</td>
                  <td className="p-3 text-black/65"><DayDate day={day} /></td>
                  <td className="p-3"><input className="w-24 rounded-md border border-black/15 px-2 py-1" placeholder="07:30" value={rows[day]?.inTime ?? ""} onChange={(e) => updateCell(day, "inTime", e.target.value)} /></td>
                  <td className="p-3"><input className="w-24 rounded-md border border-black/15 px-2 py-1" placeholder="08:00" value={rows[day]?.outTime ?? ""} onChange={(e) => updateCell(day, "outTime", e.target.value)} /></td>
                  <td className="p-3"><input className="w-32 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.vehicleNo ?? ""} onChange={(e) => updateCell(day, "vehicleNo", e.target.value)} /></td>
                  <td className="p-3"><input className="w-20 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.classType ?? "LMV"} onChange={(e) => updateCell(day, "classType", e.target.value)} /></td>
                  <td className="p-3"><input className="w-32 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.trainer ?? ""} onChange={(e) => updateCell(day, "trainer", e.target.value)} /></td>
                  <td className="p-3"><input className="w-48 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.topic ?? ""} onChange={(e) => updateCell(day, "topic", e.target.value)} /></td>
                  <td className="p-3">
                    <select className="rounded-md border border-black/15 px-2 py-1" value={rows[day]?.status ?? "Present"} onChange={(e) => updateCell(day, "status", e.target.value)}>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">Leave</option>
                    </select>
                  </td>
                  <td className="p-3"><input className="w-28 rounded-md border border-black/15 px-2 py-1" placeholder="Signed" value={rows[day]?.studentSign ?? ""} onChange={(e) => updateCell(day, "studentSign", e.target.value)} /></td>
                  <td className="p-3"><button className="rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white" onClick={() => saveDay(day)} type="button">{savingDay === day ? "Saving..." : "Save"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {loading ? <p className="text-sm text-black/60">Loading...</p> : null}
      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
    </div>
  );
}

export function VideoLecturesPage({
  studentId,
  embedded = false,
  totalDays = 26
}: {
  studentId: string;
  embedded?: boolean;
  totalDays?: number;
}) {
  const { rows, loading, message, savingDay, updateCell, saveDay } = useModuleData(studentId, "video_lectures", totalDays, videoLectureDefaults);

  const seen = useMemo(
    () => Array.from({ length: totalDays }, (_, index) => index + 1).filter((day) => rows[day]?.status === "Seen").length,
    [rows, totalDays]
  );

  return (
    <div className="grid gap-6">
      <StudentProfilePageHeader embedded={embedded} studentId={studentId} title="Video Lectures" description="Track seen and pending lecture videos day-wise." />
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile label="Seen" value={`${seen}`} />
        <SummaryTile label="Pending" value={`${totalDays - seen}`} />
        <SummaryTile label="Total Days" value={`${totalDays}`} />
      </div>
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-brand-teal text-white">
              <tr><th className="p-3">Day</th><th className="p-3">Date</th><th className="p-3">Lecture Title</th><th className="p-3">Duration (min)</th><th className="p-3">Status</th><th className="p-3">Watched At</th><th className="p-3">Action</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => (
                <tr className="border-t border-brand-teal/10" key={day}>
                  <td className="p-3 font-semibold text-brand-ink">{day}</td>
                  <td className="p-3 text-black/65"><DayDate day={day} /></td>
                  <td className="p-3"><input className="w-72 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.lectureTitle ?? ""} onChange={(e) => updateCell(day, "lectureTitle", e.target.value)} /></td>
                  <td className="p-3"><input className="w-24 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.durationMin ?? ""} onChange={(e) => updateCell(day, "durationMin", e.target.value.replace(/[^0-9]/g, ""))} /></td>
                  <td className="p-3">
                    <select className="rounded-md border border-black/15 px-2 py-1" value={rows[day]?.status ?? "Pending"} onChange={(e) => updateCell(day, "status", e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Seen">Seen</option>
                    </select>
                  </td>
                  <td className="p-3"><input className="w-36 rounded-md border border-black/15 px-2 py-1" placeholder="HH:MM" value={rows[day]?.watchedAt ?? ""} onChange={(e) => updateCell(day, "watchedAt", e.target.value)} /></td>
                  <td className="p-3"><button className="rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white" onClick={() => saveDay(day)} type="button">{savingDay === day ? "Saving..." : "Save"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {loading ? <p className="text-sm text-black/60">Loading...</p> : null}
      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
    </div>
  );
}

export function TrainerFeedbackPage({ studentId, embedded = false }: { studentId: string; embedded?: boolean }) {
  const { rows, loading, message, savingDay, updateCell, saveDay } = useModuleData(studentId, "trainer_feedback", 26, trainerFeedbackDefaults);

  return (
    <div className="grid gap-6">
      <StudentProfilePageHeader embedded={embedded} studentId={studentId} title="Trainer Feedback" description="Day-wise trainer notes for what was taught and mistakes observed." />
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-brand-teal text-white">
              <tr><th className="p-3">Day</th><th className="p-3">Date</th><th className="p-3">Trainer</th><th className="p-3">What Taught Today</th><th className="p-3">Mistakes</th><th className="p-3">Action</th><th className="p-3">Save</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: 26 }, (_, index) => index + 1).map((day) => (
                <tr className="border-t border-brand-teal/10" key={day}>
                  <td className="p-3 font-semibold text-brand-ink">{day}</td>
                  <td className="p-3 text-black/65"><DayDate day={day} /></td>
                  <td className="p-3"><input className="w-32 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.trainerName ?? ""} onChange={(e) => updateCell(day, "trainerName", e.target.value)} /></td>
                  <td className="p-3"><input className="w-64 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.taughtToday ?? ""} onChange={(e) => updateCell(day, "taughtToday", e.target.value)} /></td>
                  <td className="p-3"><input className="w-64 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.mistakes ?? ""} onChange={(e) => updateCell(day, "mistakes", e.target.value)} /></td>
                  <td className="p-3"><input className="w-48 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.action ?? ""} onChange={(e) => updateCell(day, "action", e.target.value)} /></td>
                  <td className="p-3"><button className="rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white" onClick={() => saveDay(day)} type="button">{savingDay === day ? "Saving..." : "Save"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {loading ? <p className="text-sm text-black/60">Loading...</p> : null}
      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
    </div>
  );
}

export function StudentFeedbackPage({ studentId, embedded = false }: { studentId: string; embedded?: boolean }) {
  const { rows, loading, message, savingDay, updateCell, saveDay } = useModuleData(studentId, "student_feedback", 26, studentFeedbackDefaults);

  return (
    <div className="grid gap-6">
      <StudentProfilePageHeader embedded={embedded} studentId={studentId} title="Feedback Student" description="Student day-wise self feedback: what was learned and mistakes selected." />
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] border-collapse text-left text-sm">
            <thead className="bg-brand-teal text-white">
              <tr><th className="p-3">Day</th><th className="p-3">Date</th><th className="p-3">What Learned</th><th className="p-3">Mistake Selected</th><th className="p-3">Confidence (1-5)</th><th className="p-3">Save</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: 26 }, (_, index) => index + 1).map((day) => (
                <tr className="border-t border-brand-teal/10" key={day}>
                  <td className="p-3 font-semibold text-brand-ink">{day}</td>
                  <td className="p-3 text-black/65"><DayDate day={day} /></td>
                  <td className="p-3"><input className="w-72 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.learnedToday ?? ""} onChange={(e) => updateCell(day, "learnedToday", e.target.value)} /></td>
                  <td className="p-3"><input className="w-72 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.selectedMistake ?? ""} onChange={(e) => updateCell(day, "selectedMistake", e.target.value)} /></td>
                  <td className="p-3">
                    <select className="rounded-md border border-black/15 px-2 py-1" value={rows[day]?.confidence ?? "3"} onChange={(e) => updateCell(day, "confidence", e.target.value)}>
                      <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
                    </select>
                  </td>
                  <td className="p-3"><button className="rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white" onClick={() => saveDay(day)} type="button">{savingDay === day ? "Saving..." : "Save"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {loading ? <p className="text-sm text-black/60">Loading...</p> : null}
      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
    </div>
  );
}

export function FleetDeviceDataPage({ studentId, embedded = false }: { studentId: string; embedded?: boolean }) {
  const { sessions, loading: sessionsLoading } = useTrainingSessions(studentId);
  const { rows, message, savingDay, updateCell, saveDay } = useModuleData(studentId, "fleet_device_data", 26, fleetDeviceDefaults);

  const dayMap = useMemo(() => {
    const map = new Map<number, TrainingSessionRow[]>();
    sessions.forEach((session) => {
      const current = map.get(session.day) ?? [];
      current.push(session);
      map.set(session.day, current);
    });
    return map;
  }, [sessions]);

  return (
    <div className="grid gap-6">
      <StudentProfilePageHeader embedded={embedded} studentId={studentId} title="Tracker / Data of Car" description="Daily route and driving behavior details linked to training sessions." />
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
            <thead className="bg-brand-teal text-white">
              <tr><th className="p-3">Day</th><th className="p-3">Date</th><th className="p-3">Vehicle</th><th className="p-3">Route</th><th className="p-3">Distance (km)</th><th className="p-3">Avg Speed</th><th className="p-3">Behavior</th><th className="p-3">Remark</th><th className="p-3">Save</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: 26 }, (_, index) => index + 1).map((day) => {
                const daySessions = dayMap.get(day) ?? [];
                const firstSession = daySessions[0];
                return (
                  <tr className="border-t border-brand-teal/10" key={day}>
                    <td className="p-3 font-semibold text-brand-ink">{day}</td>
                    <td className="p-3 text-black/65">{firstSession ? formatDate(firstSession.date) : <DayDate day={day} />}</td>
                    <td className="p-3 text-black/65">{firstSession ? `${firstSession.vehicleName} (${firstSession.vehicleNo})` : "-"}</td>
                    <td className="p-3"><input className="w-56 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.route ?? ""} onChange={(e) => updateCell(day, "route", e.target.value)} /></td>
                    <td className="p-3"><input className="w-24 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.distanceKm ?? ""} onChange={(e) => updateCell(day, "distanceKm", e.target.value)} /></td>
                    <td className="p-3"><input className="w-24 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.avgSpeed ?? ""} onChange={(e) => updateCell(day, "avgSpeed", e.target.value)} /></td>
                    <td className="p-3"><input className="w-48 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.behavior ?? ""} onChange={(e) => updateCell(day, "behavior", e.target.value)} /></td>
                    <td className="p-3"><input className="w-48 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.remark ?? ""} onChange={(e) => updateCell(day, "remark", e.target.value)} /></td>
                    <td className="p-3"><button className="rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white" onClick={() => saveDay(day)} type="button">{savingDay === day ? "Saving..." : "Save"}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {sessionsLoading ? <p className="text-sm text-black/60">Loading fleet-linked sessions...</p> : null}
      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
    </div>
  );
}

export function CarCameraRecordingPage({ studentId, embedded = false }: { studentId: string; embedded?: boolean }) {
  const { sessions, loading } = useTrainingSessions(studentId);
  const { rows, message, savingDay, updateCell, saveDay } = useModuleData(studentId, "car_camera_recording", 26, carCameraDefaults);

  const dayMap = useMemo(() => {
    const map = new Map<number, TrainingSessionRow[]>();
    sessions.forEach((session) => {
      const current = map.get(session.day) ?? [];
      current.push(session);
      map.set(session.day, current);
    });
    return map;
  }, [sessions]);

  return (
    <div className="grid gap-6">
      <StudentProfilePageHeader embedded={embedded} studentId={studentId} title="Training Recording" description="Day-wise camera recording details linked with each training day." />
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
            <thead className="bg-brand-teal text-white">
              <tr><th className="p-3">Day</th><th className="p-3">Date</th><th className="p-3">Camera</th><th className="p-3">Start</th><th className="p-3">Duration</th><th className="p-3">Recording Ref</th><th className="p-3">Status</th><th className="p-3">Note</th><th className="p-3">Save</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: 26 }, (_, index) => index + 1).map((day) => {
                const session = dayMap.get(day)?.[0];
                const recordingRef = session?.recordingId ?? "";
                const isUrl = /^https?:\/\//i.test(recordingRef);
                return (
                  <tr className="border-t border-brand-teal/10" key={day}>
                    <td className="p-3 font-semibold text-brand-ink">{day}</td>
                    <td className="p-3 text-black/65">{session ? formatDate(session.date) : <DayDate day={day} />}</td>
                    <td className="p-3"><input className="w-36 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.cameraType ?? "Front + Cabin"} onChange={(e) => updateCell(day, "cameraType", e.target.value)} /></td>
                    <td className="p-3 text-black/65">{session ? new Date(session.startsAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                    <td className="p-3 text-black/65">{session ? `${session.durationMinutes} min` : "-"}</td>
                    <td className="p-3 text-black/65">{recordingRef ? (isUrl ? <a className="text-brand-teal underline" href={recordingRef} rel="noreferrer" target="_blank">Open</a> : recordingRef) : "-"}</td>
                    <td className="p-3">
                      <select className="rounded-md border border-black/15 px-2 py-1" value={rows[day]?.status ?? "Pending"} onChange={(e) => updateCell(day, "status", e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="Available">Available</option>
                        <option value="Reviewed">Reviewed</option>
                      </select>
                    </td>
                    <td className="p-3"><input className="w-52 rounded-md border border-black/15 px-2 py-1" value={rows[day]?.note ?? ""} onChange={(e) => updateCell(day, "note", e.target.value)} /></td>
                    <td className="p-3"><button className="rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white" onClick={() => saveDay(day)} type="button">{savingDay === day ? "Saving..." : "Save"}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {loading ? <p className="text-sm text-black/60">Loading camera-linked sessions...</p> : null}
      {message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
    </div>
  );
}
