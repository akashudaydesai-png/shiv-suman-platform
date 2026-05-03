import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackCars, PublicCar, withFallback } from "@/lib/public-fallbacks";

export default async function CarsPublicPage() {
  const liveCars = await apiGet<PublicCar[]>("/public/cars", []);
  const cars = withFallback(liveCars, fallbackCars);

  return (
    <main className="dark-premium premium-shell min-h-screen">
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="premium-kicker">Training Cars</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">Cars connected to branch training operations.</h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold text-white/64">Registration, fleet device, camera readiness, and branch ownership stay visible from the dashboard to the website.</p>
          </div>
          <div className="rounded-md border border-[#f6bd55]/30 bg-[#f6bd55]/10 px-4 py-3 text-sm font-black text-[#f6bd55] shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
            {cars.length} live cars
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <article key={car.id} className="premium-card group overflow-hidden">
              <div className="relative overflow-hidden">
                <img alt={car.name} className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.04]" src={car.imageUrl ?? fallbackCars[0].imageUrl} />
                <div className="absolute left-4 top-4 rounded-md bg-[#031312]/88 px-3 py-2 text-xs font-black text-[#f6bd55] backdrop-blur">
                  {car.registrationNo}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-black uppercase text-brand-orange">{car.branchName}</p>
                <h2 className="mt-3 text-2xl font-black text-white">{car.name}</h2>
                <div className="mt-5 grid gap-2 text-sm font-semibold text-white/68">
                  <p className="premium-result rounded-md px-3 py-2">Fleet Device: {car.fleetDeviceId ?? "Pending integration"}</p>
                  <p className="premium-result rounded-md px-3 py-2">Camera Device: {car.cameraDeviceId ?? "Pending integration"}</p>
                  <p className="premium-result rounded-md px-3 py-2">Added On: {new Date(car.createdAt ?? Date.now()).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
