import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";

type ContactPageData = {
  title: string;
  contentJson: {
    summary?: string;
    content?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };
};

export default async function ContactPage() {
  const page = await apiGet<ContactPageData | null>("/public/pages/contact", null);
  const title = page?.title ?? "Contact";
  const data = page?.contentJson ?? {};
  return (
    <main>
      <PublicNav />
      <section className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-orange">Shiv Suman Motor Training</p>
        <h1 className="mt-4 text-4xl font-bold text-brand-ink">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-black/70">{data.summary ?? "Contact the nearest branch for training and RTO services."}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-brand-ink">Contact Details</h2>
            <p className="mt-3 text-black/70">Phone: {data.phone ?? "-"}</p>
            <p className="text-black/70">Email: {data.email ?? "-"}</p>
            <p className="text-black/70">WhatsApp: {data.whatsapp ?? "-"}</p>
            <p className="mt-2 text-black/70">Address: {data.address ?? "-"}</p>
          </div>
          <div className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-brand-ink">Message</h2>
            <p className="mt-3 whitespace-pre-line text-black/70">{data.content ?? "For admissions and branch support, call or visit us."}</p>
            {data.ctaUrl ? (
              <a className="mt-4 inline-flex rounded-md bg-brand-teal px-4 py-2 font-semibold text-white" href={data.ctaUrl} target="_blank" rel="noreferrer">
                {data.ctaLabel || "Open Link"}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
