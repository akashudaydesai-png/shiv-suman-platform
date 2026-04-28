import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";

type Course = {
  id: string;
  name: string;
  durationDays: number;
  vehicleClasses: string[];
  totalAmount: number;
  installments: Array<{ id: string; sequence: number; purpose: string; amount: number }>;
};

export default async function CoursesPage() {
  const courses = await apiGet<Course[]>("/public/courses", []);
  return (
    <main>
      <PublicNav />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <h1 className="text-4xl font-bold text-brand-ink">Courses</h1>
        <p className="mt-3 text-black/65">Dynamic driving courses with installment plans and license support.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="rounded-md border border-brand-teal/20 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-brand-ink">{course.name}</h2>
              <p className="mt-2 text-sm text-black/60">{course.durationDays} days | {course.vehicleClasses.join(", ")}</p>
              <p className="mt-4 text-3xl font-bold text-brand-teal">Rs {course.totalAmount}</p>
              <div className="mt-5 grid gap-2">
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
