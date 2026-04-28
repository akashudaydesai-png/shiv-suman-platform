import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";

type Trainer = {
  id: string;
  fullName: string;
  branch: { name: string } | null;
};

export default async function TrainersPage() {
  const trainers = await apiGet<Trainer[]>("/public/trainers", []);
  return (
    <main>
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <h1 className="text-4xl font-bold text-brand-ink">Trainers</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {trainers.map((trainer) => (
            <article key={trainer.id} className="rounded-md border border-brand-teal/20 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-brand-ink">{trainer.fullName}</h2>
              <p className="mt-2 text-sm text-black/60">{trainer.branch?.name ?? "All branches"}</p>
              <p className="mt-4 text-sm text-black/70">Training quality, safe driving habits, and DL test readiness.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
