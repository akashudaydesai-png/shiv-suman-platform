import Link from "next/link";

const navItems = ["Courses", "Cars", "Trainers", "Branches", "Blog", "Contact"];

export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 shadow-[0_12px_40px_rgba(16,25,22,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-ink text-sm font-black text-white shadow-[0_14px_30px_rgba(16,25,22,0.18)]">
            SS
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-black text-brand-ink">Shiv Suman</span>
            <span className="block truncate text-xs font-bold text-brand-teal">Motor Training School</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-md border border-black/10 bg-white/80 p-1 text-sm font-semibold text-brand-ink md:flex">
          {navItems.map((item) => (
            <Link className="rounded-md px-3 py-2 hover:bg-brand-mist hover:text-brand-teal" key={item} href={`/${item.toLowerCase()}`}>
              {item}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="rounded-md bg-brand-ink px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(16,25,22,0.20)] hover:bg-brand-teal"
        >
          Dashboard
        </Link>
      </div>
    </header>
  );
}
