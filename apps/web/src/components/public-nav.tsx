import Link from "next/link";

const navItems = ["Courses", "Cars", "Trainers", "Branches", "Blog", "Contact"];

export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-bold text-brand-teal">
          Shiv Suman Motor Training
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-brand-ink md:flex">
          {navItems.map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`}>
              {item}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
