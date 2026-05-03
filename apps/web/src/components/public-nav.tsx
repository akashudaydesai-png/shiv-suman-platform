import Link from "next/link";
import { Facebook, Instagram, Linkedin, MapPin, Phone, Youtube } from "lucide-react";

const navItems = ["Home", "Courses", "Cars", "Trainers", "Branches", "Blog", "Contact"];

export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#04100f]/82 text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="border-b border-white/8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-2 text-xs font-semibold text-white/72">
          <span className="inline-flex min-w-0 items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#f6bd55]" />
            <span className="truncate">Gala No L-10 Waterfront Apartment, Near Rankala D Mart 416012</span>
          </span>
          <span className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-white">
              <Phone className="h-3.5 w-3.5 text-[#f6bd55]" />
              72491 05382
            </span>
            <span className="hidden items-center gap-3 sm:flex">
              <Facebook className="h-3.5 w-3.5" />
              <Instagram className="h-3.5 w-3.5" />
              <Linkedin className="h-3.5 w-3.5" />
              <Youtube className="h-3.5 w-3.5" />
            </span>
          </span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[linear-gradient(135deg,#0d7770,#f6bd55)] text-xl font-black text-white shadow-[0_18px_40px_rgba(31,182,166,0.22)]">
            S
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-black tracking-wide">SHIV SUMAN</span>
            <span className="block truncate text-xs font-black text-[#63d6c9]">MOTOR TRAINING SCHOOL</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/6 p-1 text-sm font-bold text-white/82 lg:flex">
          {navItems.map((item) => {
            const href = item === "Home" ? "/" : `/${item.toLowerCase()}`;
            return (
              <Link className="rounded-md px-3 py-2 hover:bg-white/10 hover:text-[#f6bd55]" key={item} href={href}>
                {item}
              </Link>
            );
          })}
        </nav>
        <Link href="/enquiry" className="gold-button rounded-md px-4 py-3 text-sm font-black">
          ENROLL NOW
          <span className="ml-2">-&gt;</span>
        </Link>
      </div>
    </header>
  );
}
