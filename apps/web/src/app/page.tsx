import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackBranches, fallbackCars, fallbackCourses, heroImageUrl, PublicCar, PublicCourse, withFallback } from "@/lib/public-fallbacks";

const highlights = [
  ["26", "day advanced training"],
  ["3", "Kolhapur branch network"],
  ["Live", "car and document workflow"]
];

export default async function HomePage() {
  const liveCars = await apiGet<PublicCar[]>("/public/cars", []);
  const liveCourses = await apiGet<PublicCourse[]>("/public/courses", []);
  const cars = withFallback(liveCars, fallbackCars);
  const courses = withFallback(liveCourses, fallbackCourses);

  return (
    <main className="bg-[#f7fbfa]">
      <PublicNav />
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden">
        <img alt="Premium training car on the road" className="absolute inset-0 h-full w-full object-cover" src={heroImageUrl} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl content-center px-5 py-14">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-bold uppercase text-white/80">Shiv Suman Motor Training</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">Kolhapur driving school for confident road-ready training.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
              Structured driving courses, license support, RTO guidance, fleet records, and branch operations in one connected system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/enquiry" className="rounded-md bg-white px-5 py-3 font-semibold text-brand-ink">
                Start Enquiry
              </Link>
              <Link href="/courses" className="rounded-md border border-white/70 px-5 py-3 font-semibold text-white">
                View Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {highlights.map(([value, label]) => (
            <div key={label} className="rounded-md border border-black/10 p-5">
              <p className="text-3xl font-bold text-brand-teal">{value}</p>
              <p className="mt-1 text-sm font-semibold text-black/65">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-brand-orange">Courses</p>
              <h2 className="mt-2 text-3xl font-bold text-brand-ink">Clear plans for every learner.</h2>
            </div>
            <Link href="/courses" className="rounded-md border border-brand-teal px-5 py-3 font-semibold text-brand-teal">
              All Courses
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <article key={course.id} className="rounded-md border border-black/10 bg-white p-6 shadow-soft">
                <p className="text-sm font-semibold text-brand-orange">{course.durationDays} days</p>
                <h3 className="mt-3 text-xl font-bold text-brand-ink">{course.name}</h3>
                <p className="mt-2 text-sm text-black/60">{course.vehicleClasses.join(", ") || "LMV"}</p>
                <p className="mt-5 text-3xl font-bold text-brand-teal">Rs {course.totalAmount}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-brand-orange">Training Cars</p>
              <h2 className="mt-2 text-3xl font-bold text-brand-ink">Clean, branch-linked cars for practical sessions.</h2>
            </div>
            <Link href="/cars" className="rounded-md border border-brand-teal px-5 py-3 font-semibold text-brand-teal">
              View Cars
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {cars.slice(0, 3).map((car) => (
              <article key={car.id} className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
                <img alt={car.name} className="h-56 w-full object-cover" src={car.imageUrl ?? fallbackCars[0].imageUrl} />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase text-black/50">{car.branchName}</p>
                  <h3 className="mt-2 text-xl font-bold text-brand-ink">{car.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-brand-teal">{car.registrationNo}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {fallbackBranches.map((branch) => (
            <article key={branch.id} className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
              <img alt={branch.name} className="h-44 w-full object-cover" src={branch.imageUrl} />
              <div className="p-5">
                <h3 className="text-xl font-bold text-brand-ink">{branch.name}</h3>
                <p className="mt-2 text-sm text-black/60">{branch.startTime} to {branch.endTime}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
