import Link from "next/link";
import { CarStage } from "@/components/car-stage";
import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";

const courses = [
  "12, 15, 20, and 26 day driving courses",
  "Two wheeler and four wheeler license support",
  "DL practice, RTO appointment, and document guidance"
];

type PublicCar = {
  id: string;
  name: string;
  registrationNo: string;
  branchName: string;
  fleetDeviceId: string | null;
  cameraDeviceId: string | null;
};

export default async function HomePage() {
  const cars = await apiGet<PublicCar[]>("/public/cars", []);
  return (
    <main>
      <PublicNav />
      <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-brand-orange">
            Motor Training Management System
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-brand-ink md:text-6xl">
            Driving training, RTO work, payments, and progress in one place.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-black/70">
            Book training slots, manage license work, track every session, and keep every branch moving with clear daily operations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/enquiry" className="rounded-md bg-brand-teal px-5 py-3 font-semibold text-white">
              Start Enquiry
            </Link>
            <Link href="/advance-booking" className="rounded-md border border-brand-teal px-5 py-3 font-semibold text-brand-teal">
              Advance Booking
            </Link>
          </div>
        </div>
        <CarStage />
      </section>
      <section className="bg-white px-5 py-14">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {courses.map((course) => (
            <div key={course} className="rounded-md border border-brand-teal/20 p-6 shadow-soft">
              <p className="font-semibold text-brand-ink">{course}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-orange">Training Cars</p>
              <h2 className="mt-2 text-3xl font-bold text-brand-ink">Cars added by admin appear here automatically.</h2>
            </div>
            <Link href="/cars" className="rounded-md border border-brand-teal px-5 py-3 font-semibold text-brand-teal">
              View All Cars
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {cars.slice(0, 6).map((car) => (
              <article key={car.id} className="rounded-md border border-brand-teal/20 bg-white p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/50">{car.branchName}</p>
                <h3 className="mt-3 text-xl font-bold text-brand-ink">{car.name}</h3>
                <p className="mt-2 text-sm text-black/65">{car.registrationNo}</p>
                <p className="mt-4 text-sm text-black/60">Fleet Device: {car.fleetDeviceId ?? "-"}</p>
                <p className="mt-1 text-sm text-black/60">Camera Device: {car.cameraDeviceId ?? "-"}</p>
              </article>
            ))}
            {!cars.length ? (
              <div className="rounded-md border border-dashed border-black/15 bg-white p-6 text-sm text-black/55">
                No cars are published yet from the admin dashboard.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
