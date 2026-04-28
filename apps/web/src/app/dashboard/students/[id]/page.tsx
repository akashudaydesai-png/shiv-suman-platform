"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AttendanceRegisterPage,
  CarCameraRecordingPage,
  FleetDeviceDataPage,
  QuizMarksPage,
  StudentFeedbackPage,
  StudentProfileTabs,
  TrainerFeedbackPage,
  type StudentProfileTabKey,
  VideoLecturesPage
} from "@/components/student-profile-modules";
import { apiBaseUrl } from "@/lib/api";

type DocumentRecord = { id: string; type: string; fileUrl: string; fileName: string | null; createdAt: string };
type Admission = { id: string; planId: string; source: string; status: string; vehicleClasses: string[]; installmentMode: boolean; slotId?: string | null; createdAt: string };
type PlanInstallment = { id: string; sequence: number; purpose: string; amount: number };
type Plan = { id: string; name: string; totalAmount: number; durationDays: number; installments: PlanInstallment[] };
type Payment = { id: string; amount: number; status: string; planInstallmentId: string | null; createdAt: string };
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
type UserOption = {
  id: string;
  fullName: string;
  branch: { name: string } | null;
  student: { studentCode: string } | null;
};
type TrainerOption = {
  id: string;
  fullName: string;
  branch: { name: string } | null;
};
type AdminActionModule = "swap-students" | "change-trainer" | "pause-students" | "stop-students" | "stop-refund" | "extended-training";
type AdminActionForm = {
  targetStudentId: string;
  newSlot: string;
  changeDate: string;
  selectedTrainerId: string;
  pauseFrom: string;
  pauseUntil: string;
  stopDate: string;
  refundAmount: string;
  refundMode: string;
  accountNumber: string;
  ifscCode: string;
  extendedFrom: string;
  extendedDays: string;
  reason: string;
};
type StudentDetail = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string;
  branch: { name: string } | null;
  student: {
    id: string;
    studentCode: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    relationName: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    bloodGroup: string | null;
    education: string | null;
    occupation: string | null;
    addressJson: Record<string, string> | null;
    photoUrl: string | null;
    signatureUrl: string | null;
    learningLicenseNo: string | null;
    learningLicenseDate: string | null;
    learningLicenseValidity: string | null;
    documents: DocumentRecord[];
    admissions: Admission[];
  } | null;
  plans: Plan[];
  payments: Payment[];
};

const extendedTrainingRateMap: Record<string, number> = {
  "12": 2500,
  "15": 3000,
  "20": 3500,
  "26": 5000
};

const apiOrigin = apiBaseUrl.replace(/\/api$/, "");

function fullFileUrl(path: string | null) {
  return path ? `${apiOrigin}${path}` : "";
}

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function calculateAge(value: string | null) {
  if (!value) return "-";
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) age -= 1;
  return `${age}`;
}

function formatMoney(value: number | null | undefined) {
  return `Rs ${value ?? 0}`;
}

function isValidIfsc(value: string) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.trim().toUpperCase());
}

function ProfileInfoCard({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded-md border border-brand-teal/20 bg-white p-4 shadow-soft ${wide ? "md:col-span-2 xl:col-span-3" : ""}`}>
      <p className="text-xs font-semibold uppercase text-black/45">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-brand-ink">{value}</p>
    </div>
  );
}

function EmptyActionForm(): AdminActionForm {
  return {
    targetStudentId: "",
    newSlot: "",
    changeDate: "",
    selectedTrainerId: "",
    pauseFrom: "",
    pauseUntil: "",
    stopDate: "",
    refundAmount: "",
    refundMode: "Bank Transfer",
    accountNumber: "",
    ifscCode: "",
    extendedFrom: "",
    extendedDays: "",
    reason: ""
  };
}

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [message, setMessage] = useState("Loading student profile...");
  const [activeTab, setActiveTab] = useState<StudentProfileTabKey>("personal-info");
  const [actionMessage, setActionMessage] = useState("");
  const [studentsForSwap, setStudentsForSwap] = useState<UserOption[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [sessions, setSessions] = useState<TrainingSessionRow[]>([]);
  const [openAction, setOpenAction] = useState<AdminActionModule | null>(null);
  const [actionForm, setActionForm] = useState<AdminActionForm>(EmptyActionForm);
  const [isSavingAction, setIsSavingAction] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("shiv_suman_token");
    fetch(`${apiBaseUrl}/users/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async (response) => {
      if (!response.ok) {
        setMessage("Unable to load student profile.");
        return;
      }
      setStudent(await response.json());
      setMessage("");
    });
  }, [params.id]);
  useEffect(() => {
    const token = localStorage.getItem("shiv_suman_token");
    Promise.all([
      fetch(`${apiBaseUrl}/users?role=STUDENT`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${apiBaseUrl}/users?role=TRAINER`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${apiBaseUrl}/student-modules/${params.id}/sessions/list`, { headers: { Authorization: `Bearer ${token}` } })
    ]).then(async ([studentsResponse, trainersResponse, sessionsResponse]) => {
      if (studentsResponse.ok) {
        const studentRows = await studentsResponse.json() as UserOption[];
        setStudentsForSwap(studentRows.filter((row) => row.id !== params.id));
      }
      if (trainersResponse.ok) {
        setTrainers(await trainersResponse.json() as TrainerOption[]);
      }
      if (sessionsResponse.ok) {
        setSessions(await sessionsResponse.json() as TrainingSessionRow[]);
      }
    });
  }, [params.id]);

  const admissionPlan = useMemo(() => {
    const planId = student?.student?.admissions[0]?.planId;
    return student?.plans.find((plan) => plan.id === planId);
  }, [student]);

  const firstPayment = student?.payments[student.payments.length - 1] ?? student?.payments[0];
  const address = student?.student?.addressJson;

  if (!student?.student) {
    return (
      <div className="grid gap-4">
        <Link className="text-sm font-semibold text-brand-teal" href="/dashboard/students">Back to Students</Link>
        <p className="font-semibold text-brand-teal">{message}</p>
      </div>
    );
  }

  const studentRecord = student;
  const profile = studentRecord.student!;

  const photoDocument = profile.documents.find((document) => document.type === "PHOTO");
  const signatureDocument = profile.documents.find((document) => document.type === "SIGNATURE");
  const aadhaarDocument = profile.documents.find((document) => document.type === "AADHAAR");
  const panDocument = profile.documents.find((document) => document.type === "PAN");
  const oldDlDocument = profile.documents.find((document) => document.type === "OLD_DRIVING_LICENSE");
  const photoUrl = profile.photoUrl || photoDocument?.fileUrl || null;
  const signatureUrl = profile.signatureUrl || signatureDocument?.fileUrl || null;
  const latestAdmission = profile.admissions[0];
  const totalInstallments = admissionPlan?.installments.length ?? 0;
  const attendanceDays = admissionPlan?.durationDays ?? 15;
  const totalPaid = studentRecord.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const validStatuses = new Set(["COMPLETED", "RUNNING", "PRESENT"]);
  const completedDays = new Set(sessions.filter((session) => validStatuses.has(session.status)).map((session) => session.day)).size;
  const remainingDays = Math.max(attendanceDays - completedDays, 0);
  const totalAmount = admissionPlan?.totalAmount ?? 0;
  const usedAmount = !attendanceDays || !totalAmount ? 0 : Math.round((totalAmount / attendanceDays) * completedDays);
  const suggestedRefundAmount = Math.max(totalPaid - usedAmount, 0);
  const extendedAmount = extendedTrainingRateMap[actionForm.extendedDays] ?? 0;

  function renderDocumentLink(label: string, path: string | null) {
    return path ? (
      <a className="rounded-md border border-brand-teal px-3 py-2 text-sm font-semibold text-brand-teal" href={fullFileUrl(path)} rel="noreferrer" target="_blank">
        {label}
      </a>
    ) : (
      <span className="rounded-md bg-black/5 px-3 py-2 text-sm text-black/45">{label}: Pending</span>
    );
  }

  function updateActionForm(field: keyof AdminActionForm, value: string) {
    setActionForm((current) => ({ ...current, [field]: value }));
  }

  function openActionModal(module: AdminActionModule) {
    setActionForm({
      ...EmptyActionForm(),
      refundAmount: module === "stop-refund" ? String(suggestedRefundAmount) : ""
    });
    setActionMessage("");
    setOpenAction(module);
  }

  function closeActionModal() {
    if (isSavingAction) return;
    setOpenAction(null);
  }

  async function saveAdminAction(module: AdminActionModule) {
    const token = localStorage.getItem("shiv_suman_token");
    const beforeValueMap = {
      "swap-students": latestAdmission?.slotId ?? "Pending slot",
      "change-trainer": "Not assigned yet",
      "pause-students": "ACTIVE",
      "stop-students": "ACTIVE",
      "stop-refund": "STOPPED",
      "extended-training": `${attendanceDays} days`
    } as const;
    const labelMap = {
      "swap-students": "Swap Slot",
      "change-trainer": "Change Trainer",
      "pause-students": "Pause Training",
      "stop-students": "Stop",
      "stop-refund": "Stop & Refund",
      "extended-training": "Extended Training"
    } as const;
    const afterPromptMap = {
      "swap-students": "Enter new slot or timing",
      "change-trainer": "Enter new trainer name",
      "pause-students": "Enter pause status or resume note",
      "stop-students": "Enter final stop status",
      "stop-refund": "Enter refund value or final refund note",
      "extended-training": "Enter extension date and extension days"
    } as const;
    const statusMap = {
      "swap-students": "Completed",
      "change-trainer": "Applied",
      "pause-students": "Paused",
      "stop-students": "Stopped",
      "stop-refund": "Refund Initiated",
      "extended-training": "Extended"
    } as const;
    const selectedSwapStudent = studentsForSwap.find((item) => item.id === actionForm.targetStudentId);
    const selectedTrainer = trainers.find((item) => item.id === actionForm.selectedTrainerId);
    const afterValueMap = {
      "swap-students": selectedSwapStudent
        ? `Swap with ${selectedSwapStudent.fullName} | New Slot ${actionForm.newSlot || "Not set"} | Date ${actionForm.changeDate || "Not set"}`
        : "",
      "change-trainer": selectedTrainer
        ? `${selectedTrainer.fullName} | Effective ${actionForm.changeDate || "Not set"}`
        : "",
      "pause-students": `Pause from ${actionForm.pauseFrom || "Not set"} until ${actionForm.pauseUntil || "Open"} `,
      "stop-students": `Stop on ${actionForm.stopDate || "Not set"}`,
      "stop-refund": `Refund Rs ${actionForm.refundAmount || "0"} via ${actionForm.refundMode} on ${actionForm.stopDate || "Not set"}${actionForm.refundMode === "Bank Transfer" ? ` | A/C ${actionForm.accountNumber} | IFSC ${actionForm.ifscCode.toUpperCase()}` : ""}`,
      "extended-training": `Extended from ${actionForm.extendedFrom || "Not set"} for ${actionForm.extendedDays || "0"} days | Amount Rs ${extendedAmount}`
    } as const;
    const reason = actionForm.reason.trim();
    const afterValue = afterValueMap[module].trim();

    if (!reason) {
      setActionMessage("Please enter the reason.");
      return;
    }
    if (module === "stop-refund") {
      if (!actionForm.refundAmount || Number(actionForm.refundAmount) <= 0) {
        setActionMessage("Please enter a valid refund amount.");
        return;
      }
      if (actionForm.refundMode === "Bank Transfer") {
        if (!/^\d{9,18}$/.test(actionForm.accountNumber.trim())) {
          setActionMessage("Account number must be 9 to 18 digits.");
          return;
        }
        if (!isValidIfsc(actionForm.ifscCode)) {
          setActionMessage("Enter a valid IFSC code.");
          return;
        }
      }
    }
    if (module === "extended-training") {
      if (!actionForm.extendedFrom) {
        setActionMessage("Please select extension start date.");
        return;
      }
      if (!actionForm.extendedDays || Number(actionForm.extendedDays) <= 0) {
        setActionMessage("Please enter valid extension days.");
        return;
      }
      if (extendedAmount <= 0) {
        setActionMessage("Extended amount calculation failed. Please check course amount and duration.");
        return;
      }
    }
    if (!afterValue) {
      setActionMessage(afterPromptMap[module]);
      return;
    }

    setIsSavingAction(true);
    setActionMessage(`Saving ${labelMap[module]} action...`);
    const response = await fetch(`${apiBaseUrl}/student-modules/${params.id}/admin-actions/${module}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        reason,
        beforeValue: beforeValueMap[module],
        afterValue,
        status: statusMap[module]
      })
    });

    setIsSavingAction(false);
    if (!response.ok) {
      setActionMessage(`${labelMap[module]} could not be saved.`);
      return;
    }

    setActionMessage(`${labelMap[module]} saved to admin audit log.`);
    setOpenAction(null);
  }

  function renderActionModal() {
    if (!openAction) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/45 px-3 py-4 backdrop-blur-sm sm:items-center">
        <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft transition-all duration-300 animate-[fadeIn_0.24s_ease]">
          <div className="border-b border-brand-teal/10 bg-brand-mist/60 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-brand-ink">
                  {openAction === "swap-students" ? "Swap Slot Form" : null}
                  {openAction === "change-trainer" ? "Change Trainer Form" : null}
                  {openAction === "pause-students" ? "Pause Training Form" : null}
                  {openAction === "stop-students" ? "Stop Training Form" : null}
                  {openAction === "stop-refund" ? "Stop & Refund Form" : null}
                  {openAction === "extended-training" ? "Extended Training Form" : null}
                </h2>
                <p className="mt-1 text-sm text-black/60">Review the student, fill the details, and save the action to admin audit log.</p>
              </div>
              <button className="rounded-md border border-black/10 px-3 py-2 text-sm font-semibold text-black/60" onClick={closeActionModal} type="button">
                Close
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-brand-teal/15 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-black/45">Student</p>
                <p className="mt-2 text-sm font-semibold text-brand-ink">{studentRecord.fullName}</p>
                <p className="mt-1 text-sm text-black/60">{profile.studentCode}</p>
              </div>
              <div className="rounded-md border border-brand-teal/15 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-black/45">Current Context</p>
                <p className="mt-2 text-sm font-semibold text-brand-ink">{studentRecord.branch?.name ?? "No branch"} | Slot {latestAdmission?.slotId ?? "Pending"}</p>
                <p className="mt-1 text-sm text-black/60">Course: {admissionPlan?.name ?? "-"}</p>
              </div>
            </div>

            {openAction === "swap-students" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-black/65">
                  Select student to swap with
                  <select className="rounded-md border border-black/15 px-3 py-3" value={actionForm.targetStudentId} onChange={(e) => updateActionForm("targetStudentId", e.target.value)}>
                    <option value="">Choose student</option>
                    {studentsForSwap.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.fullName} | {item.student?.studentCode ?? "Pending"} | {item.branch?.name ?? "No branch"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-black/65">
                  New slot
                  <input className="rounded-md border border-black/15 px-3 py-3" placeholder="08:30 AM Batch" value={actionForm.newSlot} onChange={(e) => updateActionForm("newSlot", e.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-black/65 md:col-span-2">
                  Effective date
                  <input className="rounded-md border border-black/15 px-3 py-3" type="date" value={actionForm.changeDate} onChange={(e) => updateActionForm("changeDate", e.target.value)} />
                </label>
              </div>
            ) : null}

            {openAction === "change-trainer" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-black/65">
                  Select trainer
                  <select className="rounded-md border border-black/15 px-3 py-3" value={actionForm.selectedTrainerId} onChange={(e) => updateActionForm("selectedTrainerId", e.target.value)}>
                    <option value="">Choose trainer</option>
                    {trainers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.fullName} | {item.branch?.name ?? "No branch"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-black/65">
                  Effective date
                  <input className="rounded-md border border-black/15 px-3 py-3" type="date" value={actionForm.changeDate} onChange={(e) => updateActionForm("changeDate", e.target.value)} />
                </label>
              </div>
            ) : null}

            {openAction === "pause-students" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-black/65">
                  Pause from
                  <input className="rounded-md border border-black/15 px-3 py-3" type="date" value={actionForm.pauseFrom} onChange={(e) => updateActionForm("pauseFrom", e.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-black/65">
                  Pause until
                  <input className="rounded-md border border-black/15 px-3 py-3" type="date" value={actionForm.pauseUntil} onChange={(e) => updateActionForm("pauseUntil", e.target.value)} />
                </label>
              </div>
            ) : null}

            {openAction === "stop-students" ? (
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm text-black/65">
                  Stop date
                  <input className="rounded-md border border-black/15 px-3 py-3" type="date" value={actionForm.stopDate} onChange={(e) => updateActionForm("stopDate", e.target.value)} />
                </label>
              </div>
            ) : null}

            {openAction === "stop-refund" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-black/65">
                  Stop date
                  <input className="rounded-md border border-black/15 px-3 py-3" type="date" value={actionForm.stopDate} onChange={(e) => updateActionForm("stopDate", e.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-black/65">
                  Refund amount
                  <input className="rounded-md border border-black/15 px-3 py-3" inputMode="numeric" placeholder="1500" value={actionForm.refundAmount} onChange={(e) => updateActionForm("refundAmount", e.target.value.replace(/[^\d]/g, ""))} />
                </label>
                <label className="grid gap-2 text-sm text-black/65 md:col-span-2">
                  Refund mode
                  <select className="rounded-md border border-black/15 px-3 py-3" value={actionForm.refundMode} onChange={(e) => updateActionForm("refundMode", e.target.value)}>
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Cheque</option>
                  </select>
                </label>
                {actionForm.refundMode === "Bank Transfer" ? (
                  <>
                    <label className="grid gap-2 text-sm text-black/65">
                      Enter account number
                      <input
                        className={`rounded-md border px-3 py-3 ${actionForm.accountNumber && !/^\d{9,18}$/.test(actionForm.accountNumber.trim()) ? "border-brand-orange" : "border-black/15"}`}
                        inputMode="numeric"
                        placeholder="Account number"
                        value={actionForm.accountNumber}
                        onChange={(e) => updateActionForm("accountNumber", e.target.value.replace(/[^\d]/g, ""))}
                      />
                    </label>
                    <label className="grid gap-2 text-sm text-black/65">
                      IFSC code
                      <input
                        className={`rounded-md border px-3 py-3 uppercase ${actionForm.ifscCode && !isValidIfsc(actionForm.ifscCode) ? "border-brand-orange" : "border-black/15"}`}
                        maxLength={11}
                        placeholder="SBIN0001234"
                        value={actionForm.ifscCode}
                        onChange={(e) => updateActionForm("ifscCode", e.target.value.toUpperCase())}
                      />
                    </label>
                  </>
                ) : null}
                <div className="rounded-md border border-brand-teal/15 bg-brand-mist/50 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase text-black/45">Refund Summary</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs text-black/45">Course Total</p>
                      <p className="mt-1 font-semibold text-brand-ink">{formatMoney(admissionPlan?.totalAmount ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black/45">Paid Amount</p>
                      <p className="mt-1 font-semibold text-brand-ink">{formatMoney(totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black/45">Days Filled</p>
                      <p className="mt-1 font-semibold text-brand-ink">{completedDays} / {attendanceDays}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black/45">Remaining Days</p>
                      <p className="mt-1 font-semibold text-brand-ink">{remainingDays}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-white px-4 py-3">
                    <div>
                      <p className="text-xs text-black/45">Suggested Refund</p>
                      <p className="mt-1 text-lg font-bold text-brand-teal">{formatMoney(suggestedRefundAmount)}</p>
                    </div>
                    <button
                      className="rounded-md border border-brand-teal px-3 py-2 text-sm font-semibold text-brand-teal"
                      onClick={() => updateActionForm("refundAmount", String(suggestedRefundAmount))}
                      type="button"
                    >
                      Use Suggested Amount
                    </button>
                  </div>
                  {actionForm.refundMode === "Bank Transfer" && actionForm.ifscCode ? (
                    <p className={`mt-3 text-sm font-semibold ${isValidIfsc(actionForm.ifscCode) ? "text-brand-teal" : "text-brand-orange"}`}>
                      {isValidIfsc(actionForm.ifscCode) ? "IFSC format looks valid." : "IFSC format is invalid."}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {openAction === "extended-training" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-black/65">
                  Extension start date
                  <input className="rounded-md border border-black/15 px-3 py-3" type="date" value={actionForm.extendedFrom} onChange={(e) => updateActionForm("extendedFrom", e.target.value)} />
                </label>
                <label className="grid gap-2 text-sm text-black/65">
                  Extended training course
                  <select className="rounded-md border border-black/15 px-3 py-3" value={actionForm.extendedDays} onChange={(e) => updateActionForm("extendedDays", e.target.value)}>
                    <option value="">Select training duration</option>
                    <option value="12">12 DAYS</option>
                    <option value="15">15 DAYS</option>
                    <option value="20">20 DAYS</option>
                    <option value="26">26 DAYS (1 MONTH)</option>
                  </select>
                </label>
                <div className="rounded-md border border-brand-teal/15 bg-brand-mist/50 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase text-black/45">Auto Amount</p>
                  <p className="mt-2 text-lg font-bold text-brand-teal">Rs {extendedAmount}</p>
                  <p className="mt-1 text-xs text-black/60">Fixed extended training rate is applied as per selected days.</p>
                </div>
              </div>
            ) : null}

            <label className="mt-5 grid gap-2 text-sm text-black/65">
              Reason
              <textarea className="min-h-[110px] rounded-md border border-black/15 px-3 py-3" placeholder="Write the reason for this action" value={actionForm.reason} onChange={(e) => updateActionForm("reason", e.target.value)} />
            </label>
            {actionMessage ? <p className="mt-4 text-sm font-semibold text-brand-teal">{actionMessage}</p> : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-teal/10 bg-white px-5 py-4">
            <p className="text-sm text-black/55">This action will appear in the matching admin audit tab.</p>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-md border border-black/10 px-4 py-2 text-sm font-semibold text-black/60" onClick={closeActionModal} type="button">
                Cancel
              </button>
              <button
                className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/25"
                disabled={isSavingAction}
                onClick={() => void saveAdminAction(openAction)}
                type="button"
              >
                {isSavingAction ? "Saving..." : openAction === "extended-training" ? "Pay Now" : "Save Action"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case "attendance":
        return <AttendanceRegisterPage embedded studentId={params.id} totalDays={attendanceDays} />;
      case "video-lectures":
        return <VideoLecturesPage embedded studentId={params.id} totalDays={attendanceDays} />;
      case "test-result":
        return <QuizMarksPage embedded studentId={params.id} />;
      case "feedback-student":
        return <StudentFeedbackPage embedded studentId={params.id} />;
      case "trainer-feedback":
        return <TrainerFeedbackPage embedded studentId={params.id} />;
      case "training-recording":
        return <CarCameraRecordingPage embedded studentId={params.id} />;
      case "tracker-data":
        return <FleetDeviceDataPage embedded studentId={params.id} />;
      case "personal-info":
      default:
        return (
          <div className="grid gap-6">
            <section className="grid gap-4 md:grid-cols-[240px_1fr]">
              <div className="rounded-md border border-brand-teal/20 bg-white p-4 shadow-soft">
                {photoUrl ? (
                  <img alt={studentRecord.fullName} className="h-52 w-full rounded-md object-cover" src={fullFileUrl(photoUrl)} />
                ) : (
                  <div className="grid h-52 place-items-center rounded-md bg-brand-mist text-sm font-semibold text-brand-teal">No Photo</div>
                )}
                <div className="mt-4 rounded-md border border-black/10 p-3">
                  <p className="text-sm font-semibold text-brand-ink">Signature</p>
                  {signatureUrl ? (
                    <img alt={`${studentRecord.fullName} signature`} className="mt-2 h-20 w-full object-contain" src={fullFileUrl(signatureUrl)} />
                  ) : <p className="mt-2 text-sm text-black/55">Not uploaded</p>}
                </div>
                <div className="mt-4 grid gap-2">
                  {renderDocumentLink("Aadhaar Card", aadhaarDocument?.fileUrl ?? null)}
                  {renderDocumentLink("PAN Card", panDocument?.fileUrl ?? null)}
                  {renderDocumentLink("Old DL", oldDlDocument?.fileUrl ?? null)}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["Full Name", studentRecord.fullName],
                    ["Student ID", profile.studentCode],
                    ["Enquiry ID", latestAdmission?.id ?? "Pending"],
                    ["Number", studentRecord.phone ?? "-"],
                    ["Email", studentRecord.email],
                    ["Branch", studentRecord.branch?.name ?? "-"],
                    ["Trainer Name", "Not assigned yet"],
                    ["Slot Booked", latestAdmission?.slotId ?? "Pending"],
                    ["Selected Course", admissionPlan?.name ?? "-"],
                    ["No. of Installments", `${totalInstallments || 0}`],
                    ["Blood Group", profile.bloodGroup ?? "-"],
                    ["Gender", profile.gender ?? "-"],
                    ["DOB", formatDate(profile.dateOfBirth)],
                    ["Education", profile.education ?? "-"],
                    ["Occupation", profile.occupation ?? "-"],
                    ["LL Number", profile.learningLicenseNo ?? "-"],
                    ["Start Date", latestAdmission ? formatDate(latestAdmission.createdAt) : "-"],
                    ["Completion Date", latestAdmission && admissionPlan?.durationDays ? formatDate(new Date(new Date(latestAdmission.createdAt).getTime() + admissionPlan.durationDays * 86400000).toISOString()) : "-"],
                    ["Admission Date", latestAdmission ? formatDate(latestAdmission.createdAt) : "-"],
                    ["Enquiry Date", latestAdmission ? formatDate(latestAdmission.createdAt) : "-"],
                    ["Advance Booking Date", latestAdmission?.source === "ADVANCE_BOOKING" ? formatDate(latestAdmission.createdAt) : "-"],
                    ["DL Test Date", "Pending"],
                    ["DL Test Result", "Pending"],
                    ["Address", [address?.addressLine1, address?.addressLine2, address?.tehsil, address?.district, address?.state, address?.pincode].filter(Boolean).join(", ") || "-"]
                  ].map(([label, value]) => <ProfileInfoCard key={label} label={label} value={value} wide={label === "Address"} />)}
                </div>

                <section className="rounded-md border border-brand-orange/25 bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-brand-ink">Admin Actions</h2>
                      <p className="mt-1 text-sm text-black/60">Quick controls for slot, trainer, training status, and refund flow.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-md border border-brand-teal px-4 py-2 text-sm font-semibold text-brand-teal transition hover:-translate-y-0.5 hover:bg-brand-teal hover:text-white" onClick={() => openActionModal("swap-students")} type="button">Swap Slot</button>
                      <button className="rounded-md border border-brand-teal px-4 py-2 text-sm font-semibold text-brand-teal transition hover:-translate-y-0.5 hover:bg-brand-teal hover:text-white" onClick={() => openActionModal("change-trainer")} type="button">Change Trainer</button>
                      <button className="rounded-md border border-brand-teal px-4 py-2 text-sm font-semibold text-brand-teal transition hover:-translate-y-0.5 hover:bg-brand-teal hover:text-white" onClick={() => openActionModal("pause-students")} type="button">Pause Training</button>
                      <button className="rounded-md border border-brand-orange px-4 py-2 text-sm font-semibold text-brand-orange transition hover:-translate-y-0.5 hover:bg-brand-orange hover:text-white" onClick={() => openActionModal("stop-students")} type="button">Stop</button>
                      <button className="rounded-md bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-soft" onClick={() => openActionModal("stop-refund")} type="button">Stop & Refund</button>
                      <button className="rounded-md border border-brand-teal px-4 py-2 text-sm font-semibold text-brand-teal transition hover:-translate-y-0.5 hover:bg-brand-teal hover:text-white" onClick={() => openActionModal("extended-training")} type="button">Extended Training</button>
                    </div>
                  </div>
                  {actionMessage ? <p className="mt-3 text-sm font-semibold text-brand-teal">{actionMessage}</p> : null}
                </section>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-brand-ink">All Payment Amount With Date And Mode</h2>
                  <span className="rounded-md bg-brand-mist px-3 py-2 text-sm font-semibold text-brand-teal">Total Paid: {formatMoney(totalPaid)}</span>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead className="bg-brand-mist text-brand-ink">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentRecord.payments.map((payment) => (
                        <tr className="border-t border-brand-teal/10" key={payment.id}>
                          <td className="p-3">{formatDate(payment.createdAt)}</td>
                          <td className="p-3 font-semibold text-brand-ink">{formatMoney(payment.amount)}</td>
                          <td className="break-words p-3">{payment.status}</td>
                          <td className="break-words p-3">{payment.status === "PAID" ? "Online / Cash" : "Pending Link"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!studentRecord.payments.length ? <p className="mt-3 text-sm text-black/60">No payments recorded yet.</p> : null}
              </div>

              <div className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
                <h2 className="text-xl font-bold text-brand-ink">Course Timeline</h2>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-md bg-brand-mist/40 p-4">
                    <p className="text-xs font-semibold uppercase text-black/45">Course</p>
                    <p className="mt-2 font-semibold text-brand-ink">{admissionPlan?.name ?? "-"}</p>
                  </div>
                  <div className="rounded-md bg-brand-mist/40 p-4">
                    <p className="text-xs font-semibold uppercase text-black/45">Duration</p>
                    <p className="mt-2 font-semibold text-brand-ink">{admissionPlan?.durationDays ?? "-"} days</p>
                  </div>
                  <div className="rounded-md bg-brand-mist/40 p-4">
                    <p className="text-xs font-semibold uppercase text-black/45">First Installment</p>
                    <p className="mt-2 font-semibold text-brand-ink">{firstPayment ? `${formatMoney(firstPayment.amount)} - ${firstPayment.status}` : "-"}</p>
                  </div>
                  <div className="rounded-md bg-brand-mist/40 p-4">
                    <p className="text-xs font-semibold uppercase text-black/45">Installment Mode</p>
                    <p className="mt-2 font-semibold text-brand-ink">{latestAdmission?.installmentMode ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
    }
  }

  return (
    <div className="grid gap-6">
      <section>
        <Link className="text-sm font-semibold text-brand-teal" href="/dashboard/students">Back to Students</Link>
        <h1 className="mt-3 text-3xl font-bold text-brand-ink">{studentRecord.fullName}</h1>
        <p className="mt-2 text-black/65">Student ID: {profile.studentCode}</p>
      </section>

      <StudentProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {renderTabContent()}
      {renderActionModal()}
    </div>
  );
}
