import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { AdvanceBookingForm } from "./advance-booking-form";

type Branch = { id: string; name: string };

export default async function AdvanceBookingPage() {
  const branches = await apiGet<Branch[]>("/public/branches", []);
  return (
    <main>
      <PublicNav />
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-4xl font-bold text-brand-ink">Advance Booking</h1>
        <p className="mt-3 text-black/65">Book one confirmed training slot with Rs 500 adjustment in first installment.</p>
        <AdvanceBookingForm branches={branches} />
      </section>
    </main>
  );
}
