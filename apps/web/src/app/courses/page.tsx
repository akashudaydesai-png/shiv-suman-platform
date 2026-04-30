import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackCourses, PublicCourse, withFallback } from "@/lib/public-fallbacks";

export default async function CoursesPage() {
  const liveCourses = await apiGet<PublicCourse[]>("/public/courses", []);
  const courses = withFallback(liveCourses, fallbackCourses);

  return (
    <main className="bg-[#f7fbfa]">
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-sm font-bold uppercase text-brand-orange">Courses</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold text-brand-ink">Driving courses with license support.</h1>
            <p className="mt-3 max-w-2xl text-black/65">Choose a training plan by days, vehicle class, and installment structure.</p>
          </div>
          <Link href="/enquiry" className="rounded-md bg-brand-teal px-5 py-3 font-semibold text-white">Enquire Now</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="rounded-md border border-black/10 bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-orange">{course.durationDays} day plan</p>
                  <h2 className="mt-2 text-2xl font-bold text-brand-ink">{course.name}</h2>
                  <p className="mt-2 text-sm text-black/60">{course.vehicleClasses.join(", ") || "LMV"}</p>
                </div>
                <p className="text-3xl font-bold text-brand-teal">Rs {course.totalAmount}</p>
              </div>
              <div className="mt-6 grid gap-2">
                {course.installments.map((item) => (
                  <div key={item.id} className="flex justify-between rounded-md bg-brand-mist px-3 py-2 text-sm">
                    <span>{item.sequence}. {item.purpose}</span>
                    <strong>Rs {item.amount}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
