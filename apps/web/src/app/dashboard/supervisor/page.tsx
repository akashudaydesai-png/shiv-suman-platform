const tasks = [
  "Branch student list",
  "Today leave students",
  "DL practice list",
  "DL test event calendar",
  "Ready students",
  "Need more practice",
  "Trainer leave status",
  "Pending practice feedback"
];

export default function SupervisorDashboardPage() {
  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Supervisor Dashboard</h1>
        <p className="mt-2 text-black/65">DL readiness, test scheduling, branch student progress, and trainer leave visibility.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tasks.map((item) => (
          <div key={item} className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
            <p className="font-semibold text-brand-ink">{item}</p>
            <p className="mt-2 text-sm text-black/60">No fleet or camera access</p>
          </div>
        ))}
      </section>
    </div>
  );
}
