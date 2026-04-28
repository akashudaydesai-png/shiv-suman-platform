const work = [
  "Enquiry follow-up",
  "Advance booking confirmation",
  "Admission document check",
  "Internal student RTO work",
  "External customer RTO work",
  "DL test documents ready",
  "Today leave students",
  "Today free slots"
];

export default function ReceptionDashboardPage() {
  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Reception Dashboard</h1>
        <p className="mt-2 text-black/65">Branch student work, documents, enquiries, bookings, and RTO tasks.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {work.map((item) => (
          <div key={item} className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
            <p className="font-semibold text-brand-ink">{item}</p>
            <p className="mt-2 text-sm text-black/60">Restricted data view</p>
          </div>
        ))}
      </section>
    </div>
  );
}
