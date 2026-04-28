import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";

type Branch = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  startTime: string;
  endTime: string;
};

export default async function BranchesPage() {
  const branches = await apiGet<Branch[]>("/public/branches", []);
  return (
    <main>
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <h1 className="text-4xl font-bold text-brand-ink">Branches</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {branches.map((branch) => (
            <article key={branch.id} className="rounded-md border border-brand-teal/20 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-brand-ink">{branch.name}</h2>
              <p className="mt-2 text-sm text-black/60">{branch.code}</p>
              <p className="mt-4 text-sm text-black/70">{branch.startTime} to {branch.endTime}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
