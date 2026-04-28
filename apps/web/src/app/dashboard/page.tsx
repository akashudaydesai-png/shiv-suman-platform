import { MetricCard } from "@/components/metric-card";

export default function DashboardPage() {
  return (
    <div className="grid gap-5">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Today</h1>
        <p className="mt-2 text-black/65">Live branch operations, pending work, and student movement.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Running sessions" value="18" />
        <MetricCard label="Free slots today" value="7" />
        <MetricCard label="Pending RTO work" value="24" tone="orange" />
        <MetricCard label="Advance bookings" value="11" />
      </section>
    </div>
  );
}
