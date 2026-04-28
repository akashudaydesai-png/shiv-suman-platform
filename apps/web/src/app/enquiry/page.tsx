import { PublicNav } from "@/components/public-nav";
import { EnquiryForm } from "./enquiry-form";

export default function EnquiryPage() {
  return (
    <main>
      <PublicNav />
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-4xl font-bold text-brand-ink">Enquiry</h1>
        <EnquiryForm />
      </section>
    </main>
  );
}
