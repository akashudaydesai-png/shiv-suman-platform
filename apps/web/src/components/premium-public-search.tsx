"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Car, MapPin, Search, Sparkles } from "lucide-react";
import type { PublicBranch, PublicCar, PublicCourse } from "@/lib/public-fallbacks";

type SearchItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  type: "Course" | "Car" | "Branch";
};

export function PremiumPublicSearch({
  courses,
  cars,
  branches
}: {
  courses: PublicCourse[];
  cars: PublicCar[];
  branches: PublicBranch[];
}) {
  const [query, setQuery] = useState("");

  const items = useMemo<SearchItem[]>(() => [
    ...courses.map((course) => ({
      id: `course-${course.id}`,
      title: course.name,
      detail: `${course.durationDays} days | Rs ${course.totalAmount} | ${course.vehicleClasses.join(", ") || "LMV"}`,
      href: "/courses",
      type: "Course" as const
    })),
    ...cars.map((car) => ({
      id: `car-${car.id}`,
      title: car.name,
      detail: `${car.registrationNo} | ${car.branchName}`,
      href: "/cars",
      type: "Car" as const
    })),
    ...branches.map((branch) => ({
      id: `branch-${branch.id}`,
      title: branch.name,
      detail: `${branch.startTime} to ${branch.endTime} | ${branch.address ?? "Kolhapur"}`,
      href: "/branches",
      type: "Branch" as const
    }))
  ], [branches, cars, courses]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items.slice(0, 4);
    return items
      .filter((item) => `${item.title} ${item.detail} ${item.type}`.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [items, query]);

  return (
    <div className="relative z-10 mt-8 max-w-3xl">
      <div className="rounded-md border border-white/14 bg-white/8 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <label className="flex items-center gap-3 rounded-md border border-[#f6bd55]/20 bg-[#031312]/88 px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-[#f6bd55]" />
          <input
            className="min-h-0 flex-1 border-0 bg-transparent p-0 text-base font-semibold text-white shadow-none placeholder:text-white/42 focus:shadow-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses, cars, branch, license support..."
            value={query}
          />
          <span className="hidden rounded-md bg-[#f6bd55]/12 px-3 py-2 text-xs font-black text-[#f6bd55] sm:inline-flex">
            LIVE
          </span>
        </label>
      </div>
      <div className="mt-3 grid gap-2 rounded-md border border-white/10 bg-[#04100f]/88 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-1 text-xs font-black uppercase text-white/46">
          <span className="inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-[#f6bd55]" /> Search Results</span>
          <span>{results.length} found</span>
        </div>
        {results.length ? results.map((item) => (
          <Link className="premium-result rounded-md px-4 py-3" href={item.href} key={item.id}>
            <span className="flex items-start justify-between gap-4">
              <span>
                <span className="text-sm font-black text-white">{item.title}</span>
                <span className="mt-1 block text-xs font-semibold text-white/56">{item.detail}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2 py-1 text-xs font-black text-[#f6bd55]">
                {item.type === "Car" ? <Car className="h-3.5 w-3.5" /> : item.type === "Branch" ? <MapPin className="h-3.5 w-3.5" /> : null}
                {item.type}
              </span>
            </span>
          </Link>
        )) : (
          <div className="rounded-md border border-[#f6bd55]/24 bg-[#f6bd55]/8 px-4 py-3 text-sm font-semibold text-[#f6bd55]">
            No match yet. Try “LMV”, “Rankala”, “Swift”, or “license”.
          </div>
        )}
      </div>
    </div>
  );
}
