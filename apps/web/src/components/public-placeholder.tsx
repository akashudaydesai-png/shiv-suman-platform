import { PublicNav } from "@/components/public-nav";

export function PublicPlaceholder({ title, text }: { title: string; text: string }) {
  return (
    <main>
      <PublicNav />
      <section className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-orange">
          Shiv Suman Motor Training
        </p>
        <h1 className="mt-4 text-4xl font-bold text-brand-ink">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-black/70">{text}</p>
      </section>
    </main>
  );
}
