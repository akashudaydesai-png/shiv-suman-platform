import Link from "next/link";

export default function RtoDashboardPage() {
  const sections = [
    {
      title: "Internal License Work",
      description: "All students added from the Student module appear here for LL, permanent license, DL practice, and document tracking.",
      href: "/dashboard/rto/internal"
    },
    {
      title: "External Customer Work",
      description: "Add outside RTO customers for duplicate license, RC renewal, transfer, address change, and other service work.",
      href: "/dashboard/rto/external"
    }
  ];

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">RTO Work</h1>
        <p className="mt-2 text-black/65">Internal student license work and external customer RTO service tracking.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((item) => (
          <Link key={item.title} className="rounded-md border border-brand-teal/20 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-orange" href={item.href}>
            <p className="text-xl font-bold text-brand-ink">{item.title}</p>
            <p className="mt-2 text-black/60">Documents received, documents ready, submitted to RTO, completed, delivered.</p>
            <p className="mt-4 text-sm font-semibold text-brand-teal">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
