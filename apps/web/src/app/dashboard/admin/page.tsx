import { MetricCard } from "@/components/metric-card";
import { AdminDashboardClient } from "./admin-dashboard-client";

const liveCards = [
  { label: "Live batch/session status", value: "18 running", detail: "Branch-wise active training sessions" },
  { label: "Running sessions", value: "12 cars", detail: "Trainer, student, and car currently mapped" },
  { label: "Car location/status", value: "9 active", detail: "Fleet devices online and session-linked" },
  { label: "Trainer/student/car mapping", value: "18 mapped", detail: "Today assigned pairings and car allocation" }
];

const workCards = [
  { label: "Pending RTO work", value: "24", tone: "orange", detail: "Internal and external RTO cases pending action" },
  { label: "Own student license pending work", value: "11", detail: "LL/DL work connected to admitted students" },
  { label: "Enquiry follow-up", value: "32", detail: "Lead follow-ups by branch and time slot demand" },
  { label: "Advance booking queue", value: "14", detail: "Booked slots and upcoming joining confirmations" },
  { label: "Today leave", value: "7", detail: "Student leave and trainer leave status" },
  { label: "Today free slots", value: "9", detail: "Open slots from leave and normal availability" }
];

const performanceCards = [
  { label: "Reception performance", value: "86%", detail: "Enquiries, admissions, RTO updates, documents ready" },
  { label: "Supervisor performance", value: "91%", detail: "DL practice, readiness, test event handling" },
  { label: "Trainer performance", value: "88%", detail: "Attendance, sessions completed, feedback quality" },
  { label: "Staff attendance and leave", value: "3 leave", detail: "Staff attendance, trainer leave requests, approvals" },
  { label: "Student progress", value: "128 active", detail: "Training days, LL status, DL readiness, pass-out status" },
  { label: "Fleet/camera alerts", value: "5", tone: "orange", detail: "Harsh events, missing recording, device offline alerts" }
];

const adminActions = [
  "Manage students",
  "Manage trainers",
  "Manage supervisors",
  "Manage reception users",
  "Create branch",
  "Create dynamic course",
  "Installment rules",
  "RTO services",
  "Document requirements",
  "SMS/WhatsApp templates",
  "Role permissions",
  "Website and blog CMS"
];

function OldAdminDashboardPage() {
  return (
    <div className="grid gap-6 pb-10">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Admin Dashboard</h1>
        <p className="mt-2 text-black/65">
          Complete control across branches, people, courses, installments, payments, RTO work, automation, fleet, and evidence.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Income today" value="Rs 1,60,600" />
        <MetricCard label="Expenses today" value="Rs 18,400" tone="orange" />
        <MetricCard label="Profit / loss" value="Rs 1,42,200" />
        <MetricCard label="System alerts" value="6" tone="orange" />
      </section>

      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-ink">Branch selector</h2>
            <p className="mt-1 text-sm text-black/60">View all branches together or focus on one branch.</p>
          </div>
          <select className="min-w-56 rounded-md border border-brand-teal/30 px-3 py-2 text-sm font-medium">
            <option>All branches</option>
            <option>Rankala</option>
            <option>Shahu Stadium</option>
            <option>Takala</option>
          </select>
        </div>
      </section>

      <DashboardSection title="Live Operations" cards={liveCards} />
      <DashboardSection title="Work Queue" cards={workCards} />
      <DashboardSection title="Performance And Monitoring" cards={performanceCards} />

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-brand-ink">Delete requests</h2>
          <p className="mt-1 text-sm text-black/60">Reception can request deletion. Admin approves or rejects with audit history.</p>
          <div className="mt-5 rounded-md bg-brand-mist p-4">
            <p className="text-sm font-semibold text-brand-ink">3 requests pending admin decision</p>
          </div>
        </div>
        <div className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-brand-ink">System alerts</h2>
          <p className="mt-1 text-sm text-black/60">Payment, device, RTO, document, and automation alerts needing admin attention.</p>
          <div className="mt-5 rounded-md bg-brand-mist p-4">
            <p className="text-sm font-semibold text-brand-ink">6 alerts open across all branches</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-brand-ink">Admin management</h2>
        <p className="mt-1 text-sm text-black/60">Admin can add, edit, pause, delete, and configure every master module.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {adminActions.map((action) => (
            <button key={action} className="rounded-md border border-brand-teal/20 px-4 py-3 text-left text-sm font-semibold text-brand-ink hover:border-brand-orange">
              {action}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}

function DashboardSection({
  title,
  cards
}: {
  title: string;
  cards: Array<{ label: string; value: string; detail: string; tone?: string }>;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-brand-ink">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <p className="font-semibold text-brand-ink">{card.label}</p>
              <span className={card.tone === "orange" ? "rounded-md bg-brand-orange px-2 py-1 text-xs font-bold text-white" : "rounded-md bg-brand-mist px-2 py-1 text-xs font-bold text-brand-teal"}>
                {card.value}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-black/60">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
