import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackBranches, fallbackCars, fallbackCourses, heroImageUrl, PublicCar, PublicCourse, withFallback } from "@/lib/public-fallbacks";

const highlights = [
  ["26", "day advanced training"],
  ["3", "branch operating network"],
  ["Live", "student, car, and RTO records"]
];

const promises = [
  "Calm first lesson",
  "RTO-ready documents",
  "Branch-wise batches",
  "Fleet-linked training"
];

export default async function HomePage() {
  const liveCars = await apiGet<PublicCar[]>("/public/cars", []);
  const liveCourses = await apiGet<PublicCourse[]>("/public/courses", []);
  const cars = withFallback(liveCars, fallbackCars);
  const courses = withFallback(liveCourses, fallbackCourses);
  const premiumCourse = courses[0];

  return (
    <main className="premium-shell min-h-screen">
      <PublicNav />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img alt="Training car on an open city road" className="h-full w-full object-cover" src={heroImageUrl} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,25,22,0.88),rgba(16,25,22,0.54),rgba(16,25,22,0.18))]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,transparent,#f4f8f6)]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl content-center px-5 pb-24 pt-14">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="max-w-3xl text-white premium-reveal">
              <p className="premium-kicker text-white/78">Shiv Suman Motor Training</p>
              <h1 className="mt-4 text-4xl font-black leading-[1.02] md:text-6xl">
                Drive clean, confident, and test-ready in Kolhapur.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
                Practical driving, license support, RTO work, branch operations, and fleet records connected in one training system.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/enquiry" className="rounded-md bg-white px-5 py-3 font-black text-brand-ink shadow-[0_18px_44px_rgba(255,255,255,0.18)]">
                  Start Enquiry
                </Link>
                <Link href="/courses" className="rounded-md border border-white/60 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur">
                  View Courses
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {promises.map((item) => (
                  <span className="rounded-md border border-white/18 bg-white/12 px-3 py-2 text-sm font-semibold text-white/88 backdrop-blur" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="premium-card hidden p-4 text-brand-ink lg:block">
              <div className="overflow-hidden rounded-md">
                <img alt={cars[0]?.name ?? "Training car"} className="h-64 w-full object-cover" src={cars[0]?.imageUrl ?? fallbackCars[0].imageUrl} />
              </div>
              <div className="grid gap-3 p-2 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-brand-orange">Today&apos;s training fleet</p>
                    <h2 className="mt-1 text-2xl font-black">{cars[0]?.name ?? "Training Car"}</h2>
                    <p className="mt-1 text-sm font-semibold text-black/58">{cars[0]?.branchName ?? "Kolhapur branch"}</p>
                  </div>
                  <span className="rounded-md bg-brand-mist px-3 py-2 text-sm font-black text-brand-teal">{cars[0]?.registrationNo ?? "MH09"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {highlights.map(([value, label]) => (
                    <div className="rounded-md border border-black/10 bg-white p-3" key={label}>
                      <p className="text-xl font-black text-brand-teal">{value}</p>
                      <p className="mt-1 text-xs font-semibold text-black/55">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-12 px-5 pb-14">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {highlights.map(([value, label]) => (
            <div key={label} className="premium-card p-5">
              <p className="text-4xl font-black text-brand-ink">{value}</p>
              <p className="mt-2 text-sm font-bold text-black/58">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="premium-kicker">Courses</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-black leading-tight text-brand-ink md:text-5xl">Plans that feel clear before the first class.</h2>
            </div>
            <Link href="/courses" className="rounded-md border border-brand-teal/30 bg-white px-5 py-3 font-black text-brand-teal shadow-[0_14px_34px_rgba(16,25,22,0.08)]">
              All Courses
            </Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="premium-card overflow-hidden">
              <div className="grid min-h-[360px] gap-6 p-6 md:grid-cols-[1fr_280px] md:items-end">
                <div>
                  <span className="rounded-md bg-brand-ink px-3 py-2 text-xs font-black uppercase text-white">Recommended</span>
                  <h3 className="mt-5 text-3xl font-black text-brand-ink">{premiumCourse?.name ?? "Premium Driving Course"}</h3>
                  <p className="mt-3 text-black/62">Training plan, license workflow, installments, and branch scheduling stay connected from admission to test day.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {(premiumCourse?.vehicleClasses ?? ["LMV"]).map((item) => (
                      <span className="rounded-md bg-brand-mist px-3 py-2 text-sm font-bold text-brand-teal" key={item}>{item}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-black/10 bg-white p-5">
                  <p className="text-sm font-bold text-black/50">Starting total</p>
                  <p className="mt-2 text-4xl font-black text-brand-teal">Rs {premiumCourse?.totalAmount ?? 0}</p>
                  <p className="mt-2 text-sm font-bold text-black/55">{premiumCourse?.durationDays ?? 0} days training</p>
                  <Link href="/enquiry" className="mt-5 inline-flex w-full justify-center rounded-md bg-brand-teal px-4 py-3 font-black text-white">
                    Book This Plan
                  </Link>
                </div>
              </div>
            </article>
            <div className="grid gap-5">
              {courses.slice(1, 3).map((course) => (
                <article key={course.id} className="premium-card p-5">
                  <p className="text-sm font-black text-brand-orange">{course.durationDays} days</p>
                  <h3 className="mt-2 text-xl font-black text-brand-ink">{course.name}</h3>
                  <p className="mt-3 text-2xl font-black text-brand-teal">Rs {course.totalAmount}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="premium-kicker">Training Cars</p>
              <h2 className="mt-2 text-3xl font-black text-brand-ink md:text-5xl">Fleet that looks ready before the key turns.</h2>
            </div>
            <Link href="/cars" className="rounded-md border border-brand-teal/30 px-5 py-3 font-black text-brand-teal">
              View Cars
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {cars.slice(0, 3).map((car) => (
              <article key={car.id} className="group overflow-hidden rounded-md border border-black/10 bg-white shadow-[0_18px_60px_rgba(16,25,22,0.10)]">
                <div className="overflow-hidden">
                  <img alt={car.name} className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.04]" src={car.imageUrl ?? fallbackCars[0].imageUrl} />
                </div>
                <div className="p-5">
                  <p className="text-xs font-black uppercase text-black/48">{car.branchName}</p>
                  <h3 className="mt-2 text-xl font-black text-brand-ink">{car.name}</h3>
                  <p className="mt-3 inline-flex rounded-md bg-brand-mist px-3 py-2 text-sm font-black text-brand-teal">{car.registrationNo}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {fallbackBranches.map((branch) => (
            <article key={branch.id} className="premium-card overflow-hidden">
              <img alt={branch.name} className="h-48 w-full object-cover" src={branch.imageUrl} />
              <div className="p-5">
                <p className="premium-kicker">{branch.code}</p>
                <h3 className="mt-2 text-xl font-black text-brand-ink">{branch.name}</h3>
                <p className="mt-2 text-sm font-semibold text-black/58">{branch.startTime} to {branch.endTime}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
