import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackTrainers, PublicTrainer, withFallback } from "@/lib/public-fallbacks";

export default async function TrainersPage() {
  const liveTrainers = await apiGet<PublicTrainer[]>("/public/trainers", []);
  const trainers = withFallback(liveTrainers, fallbackTrainers);

  return (
    <main className="bg-[#f7fbfa]">
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-sm font-bold uppercase text-brand-orange">Trainers</p>
        <h1 className="mt-2 text-4xl font-bold text-brand-ink">Patient coaching for real road confidence.</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {trainers.map((trainer, index) => (
            <article key={trainer.id} className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
              <img alt={trainer.fullName} className="h-64 w-full object-cover" src={trainer.imageUrl ?? fallbackTrainers[index % fallbackTrainers.length].imageUrl} />
              <div className="p-6">
                <h2 className="text-xl font-bold text-brand-ink">{trainer.fullName}</h2>
                <p className="mt-2 text-sm font-semibold text-brand-teal">{trainer.branch?.name ?? "All branches"}</p>
                <p className="mt-4 text-sm leading-6 text-black/65">Training quality, safe driving habits, reverse practice, traffic judgement, and DL test readiness.</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
