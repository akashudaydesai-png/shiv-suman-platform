import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackCars, PublicCar, withFallback } from "@/lib/public-fallbacks";

export default async function CarsPublicPage() {
  const liveCars = await apiGet<PublicCar[]>("/public/cars", []);
  const cars = withFallback(liveCars, fallbackCars);

  return (
    <main className="bg-[#f7fbfa]">
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-sm font-bold uppercase text-brand-orange">Training Cars</p>
        <h1 className="mt-2 text-4xl font-bold text-brand-ink">Cars connected to branch training operations.</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <article key={car.id} className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
              <img alt={car.name} className="h-60 w-full object-cover" src={car.imageUrl ?? fallbackCars[0].imageUrl} />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase text-black/50">{car.branchName}</p>
                <h2 className="mt-3 text-2xl font-bold text-brand-ink">{car.name}</h2>
                <p className="mt-2 text-sm font-semibold text-brand-teal">{car.registrationNo}</p>
                <div className="mt-5 grid gap-2 text-sm text-black/60">
                  <p>Fleet Device: {car.fleetDeviceId ?? "-"}</p>
                  <p>Camera Device: {car.cameraDeviceId ?? "-"}</p>
                  <p>Added On: {new Date(car.createdAt ?? Date.now()).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
