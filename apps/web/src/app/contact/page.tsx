import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackBranches } from "@/lib/public-fallbacks";

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

const fallbackContact = {
  summary: "Admissions, license support, RTO guidance, and branch visits for Kolhapur learners.",
  content: "Visit the nearest branch or send an enquiry. Our team will help you choose the right training plan and document path.",
  phone: "7249105382",
  email: "akashudaydesai@gmail.com",
  whatsapp: "7249105382",
  address: "Waterfront Rankala, Kolhapur"
};

export default async function ContactPage() {
  const page = await apiGet<ContactPageData | null>("/public/pages/contact", null);
  const title = page?.title ?? "Contact Shiv Suman Motor Training";
  const data = { ...fallbackContact, ...(page?.contentJson ?? {}) };

  return (
    <main className="bg-[#f7fbfa]">
      <PublicNav />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-sm font-bold uppercase text-brand-orange">Contact</p>
          <h1 className="mt-3 text-4xl font-bold text-brand-ink">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-black/70">{data.summary}</p>
          <div className="mt-8 rounded-md border border-black/10 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-brand-ink">Contact Details</h2>
            <div className="mt-4 grid gap-3 text-black/70">
              <p>Phone: {data.phone}</p>
              <p>Email: {data.email}</p>
              <p>WhatsApp: {data.whatsapp}</p>
              <p>Address: {data.address}</p>
            </div>
            <p className="mt-5 leading-7 text-black/65">{data.content}</p>
          </div>
        </div>
        <div className="grid gap-4">
          {fallbackBranches.map((branch) => (
            <article key={branch.id} className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
              <img alt={branch.name} className="h-36 w-full object-cover" src={branch.imageUrl} />
              <div className="p-4">
                <h3 className="font-bold text-brand-ink">{branch.name}</h3>
                <p className="mt-1 text-sm text-black/60">{branch.startTime} to {branch.endTime}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
