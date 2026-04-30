import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackBranches, PublicBranch, withFallback } from "@/lib/public-fallbacks";

export default async function BranchesPage() {
  const liveBranches = await apiGet<PublicBranch[]>("/public/branches", []);
  const branches = withFallback(liveBranches, fallbackBranches);

  return (
    <main className="bg-[#f7fbfa]">
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-sm font-bold uppercase text-brand-orange">Branches</p>
        <h1 className="mt-2 text-4xl font-bold text-brand-ink">Visit the nearest training branch.</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {branches.map((branch, index) => (
            <article key={branch.id} className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
              <img alt={branch.name} className="h-52 w-full object-cover" src={branch.imageUrl ?? fallbackBranches[index % fallbackBranches.length].imageUrl} />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-brand-ink">{branch.name}</h2>
                <p className="mt-2 text-sm font-semibold text-brand-teal">{branch.code}</p>
                <p className="mt-4 text-sm text-black/70">{branch.address ?? "Kolhapur"}</p>
                <p className="mt-3 text-sm font-semibold text-black/70">{branch.startTime} to {branch.endTime}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
