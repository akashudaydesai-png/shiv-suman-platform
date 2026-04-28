import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";

type PublicCar = {
  id: string;
  name: string;
  registrationNo: string;
  branchId: string;
  branchName: string;
  fleetDeviceId: string | null;
  cameraDeviceId: string | null;
  createdAt: string;
};

export default async function CarsPublicPage() {
  const cars = await apiGet<PublicCar[]>("/public/cars", []);

  return (
    <main>
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-orange">Public Cars</p>
        <h1 className="mt-2 text-4xl font-bold text-brand-ink">Cars from the admin dashboard.</h1>
        <p className="mt-3 max-w-2xl text-black/65">
          Whenever the admin creates a car profile in the dashboard, that car shows up here automatically for the public website.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <article key={car.id} className="rounded-md border border-brand-teal/20 bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/50">{car.branchName}</p>
              <h2 className="mt-3 text-2xl font-bold text-brand-ink">{car.name}</h2>
              <p className="mt-2 text-sm text-black/65">{car.registrationNo}</p>
              <div className="mt-5 grid gap-2 text-sm text-black/60">
                <p>Fleet Device: {car.fleetDeviceId ?? "-"}</p>
                <p>Camera Device: {car.cameraDeviceId ?? "-"}</p>
                <p>Added On: {new Date(car.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            </article>
          ))}
          {!cars.length ? (
            <div className="rounded-md border border-dashed border-black/15 bg-white p-6 text-sm text-black/55">
              No cars added yet.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
