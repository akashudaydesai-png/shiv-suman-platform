import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackCourses, PublicCourse, withFallback } from "@/lib/public-fallbacks";

export default async function CoursesPage() {
  const liveCourses = await apiGet<PublicCourse[]>("/public/courses", []);
  const courses = withFallback(liveCourses, fallbackCourses);

  return (
    <main className="premium-shell min-h-screen">
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="premium-kicker">Courses</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-brand-ink md:text-6xl">Driving courses with license support.</h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold text-black/62">Choose a training plan by days, vehicle class, and installment structure.</p>
          </div>
          <Link href="/enquiry" className="rounded-md bg-brand-ink px-5 py-3 font-black text-white shadow-[0_18px_44px_rgba(16,25,22,0.18)] hover:bg-brand-teal">Enquire Now</Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {courses.map((course, index) => (
            <article key={course.id} className="premium-card overflow-hidden">
              <div className="border-b border-black/10 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-brand-orange">{course.durationDays} day plan</p>
                    <h2 className="mt-2 text-2xl font-black text-brand-ink">{course.name}</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(course.vehicleClasses.length ? course.vehicleClasses : ["LMV"]).map((item) => (
                        <span className="rounded-md bg-brand-mist px-3 py-2 text-xs font-black text-brand-teal" key={item}>{item}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-md bg-brand-ink px-4 py-3 text-right text-white">
                    <p className="text-xs font-bold text-white/62">Total</p>
                    <p className="text-2xl font-black">Rs {course.totalAmount}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 p-5">
                {course.installments.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 rounded-md border border-black/10 bg-white px-3 py-3 text-sm font-semibold">
                    <span className="text-black/64">{item.sequence}. {item.purpose}</span>
                    <strong className="text-brand-ink">Rs {item.amount}</strong>
                  </div>
                ))}
                <Link className="mt-3 inline-flex justify-center rounded-md border border-brand-teal/30 bg-brand-mist px-4 py-3 font-black text-brand-teal" href={`/enquiry?course=${encodeURIComponent(course.name)}`}>
                  Select Plan {index + 1}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
