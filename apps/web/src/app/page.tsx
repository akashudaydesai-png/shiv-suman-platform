import Link from "next/link";
import { CalendarDays, Car, CheckCircle2, Clock3, GraduationCap, Medal, Phone, ShieldCheck, Star, Trophy } from "lucide-react";
import { PublicNav } from "@/components/public-nav";
import { PremiumPublicSearch } from "@/components/premium-public-search";
import { apiGet } from "@/lib/api";
import { fallbackBranches, fallbackCars, fallbackCourses, heroImageUrl, PublicCar, PublicCourse, withFallback } from "@/lib/public-fallbacks";

const heroStats = [
  ["25+", "Years of trust"],
  ["5000+", "Happy students"],
  ["15+", "Training vehicles"],
  ["98%", "Success rate"]
];

const trustItems = [
  [ShieldCheck, "Expert Trainers", "Certified and experienced"],
  [Car, "Modern Vehicles", "Safe and well maintained"],
  [Trophy, "Proven Results", "Road-ready training"],
  [CalendarDays, "Flexible Batches", "Timings that fit you"]
] as const;

const courseImages = [
  fallbackCars[0].imageUrl,
  "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85"
];

export default async function HomePage() {
  const liveCars = await apiGet<PublicCar[]>("/public/cars", []);
  const liveCourses = await apiGet<PublicCourse[]>("/public/courses", []);
  const cars = withFallback(liveCars, fallbackCars);
  const courses = withFallback(liveCourses, fallbackCourses);

  return (
    <main className="dark-premium premium-shell min-h-screen overflow-hidden">
      <PublicNav />

      <section className="relative">
        <div className="absolute inset-0">
          <img alt="Premium training car on city road" className="h-full w-full object-cover opacity-78" src={heroImageUrl} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#04100f_0%,rgba(4,16,15,0.88)_38%,rgba(4,16,15,0.30)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,transparent,#061716)]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-112px)] max-w-7xl content-center px-5 py-16">
          <div className="max-w-3xl premium-reveal">
            <p className="premium-kicker">25 years of trust. Thousands of safe drivers.</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">
              Your path to <span className="text-[#63d6c9]">confident</span> driving
            </h1>
            <p className="mt-5 text-2xl font-semibold text-white/92">Since <span className="text-[#f6bd55]">1998</span></p>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/78">
              Professional training. Personal attention. Safe drivers for life.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/enquiry" className="gold-button rounded-md px-6 py-4 text-sm font-black">
                BOOK A CLASS
                <span className="ml-2">-&gt;</span>
              </Link>
              <Link href="/courses" className="premium-outline rounded-md px-6 py-4 text-sm font-black">
                OUR COURSES
                <span className="ml-2">-&gt;</span>
              </Link>
            </div>

            <PremiumPublicSearch courses={courses} cars={cars} branches={fallbackBranches} />
          </div>

          <div className="mt-10 grid max-w-5xl gap-3 rounded-md border border-white/12 bg-white/8 p-4 backdrop-blur-xl md:grid-cols-4">
            {trustItems.map(([Icon, title, text]) => (
              <div className="flex items-center gap-3 border-white/10 p-2 md:border-r md:last:border-r-0" key={title}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-[#f6bd55]/28 bg-[#0e4a45] text-[#f6bd55]">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black">{title}</span>
                  <span className="block text-xs font-semibold text-white/58">{text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-[linear-gradient(135deg,rgba(6,88,82,0.72),rgba(4,16,15,0.92))] px-5 py-12">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[1fr_180px] md:items-center">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map(([value, label]) => (
              <div className="rounded-md border border-white/10 bg-white/6 p-5" key={label}>
                <p className="text-4xl font-black text-[#f6bd55]">{value}</p>
                <p className="mt-2 text-sm font-black uppercase text-white/82">{label}</p>
              </div>
            ))}
          </div>
          <Link href="/cars" className="group grid h-28 place-items-center rounded-md border border-[#f6bd55]/50 bg-[#f6bd55]/8 text-center font-black text-[#f6bd55]">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-[#f6bd55]/70 transition group-hover:scale-105">PLAY</span>
          </Link>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="premium-kicker">About us</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">More than just <span className="text-[#63d6c9]">driving</span> lessons</h2>
            <p className="mt-5 max-w-xl leading-8 text-white/68">
              We build responsible drivers with structured training, license support, document workflows, and branch-wise operations.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Personalized Training", "Affordable Fees", "Focus on Safety", "Lifetime Support"].map((item) => (
                <span className="inline-flex items-center gap-2 text-sm font-bold text-white/82" key={item}>
                  <CheckCircle2 className="h-4 w-4 text-[#f6bd55]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <img alt="Road seen through rear-view mirror" className="h-[360px] w-full rounded-md border border-[#f6bd55]/35 object-cover shadow-[0_28px_90px_rgba(0,0,0,0.34)]" src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85" />
            <div className="absolute -bottom-7 right-6 grid h-32 w-32 place-items-center rounded-full border border-[#f6bd55]/60 bg-[#082321] text-center shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
              <span className="text-3xl font-black text-[#f6bd55]">25+</span>
              <span className="-mt-8 text-xs font-black uppercase text-white/70">Years of trust</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="premium-kicker">Our courses</p>
            <h2 className="mt-3 text-4xl font-black">Courses We Offer</h2>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["All Courses", "Beginner Friendly", "Advanced Training", "License Assistance", "Specialized Courses"].map((item, index) => (
              <span className={index === 0 ? "rounded-md bg-[#0e5c55] px-5 py-3 text-sm font-black text-white" : "rounded-md px-5 py-3 text-sm font-bold text-white/68 hover:bg-white/8"} key={item}>
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {courses.slice(0, 4).map((course, index) => (
              <article className="course-card premium-card group" key={course.id}>
                <div className="relative overflow-hidden rounded-t-md">
                  <img alt={course.name} className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.05]" src={courseImages[index % courseImages.length]} />
                  <span className="absolute left-4 top-4 rounded-md bg-[#06302d]/86 px-3 py-2 text-xs font-black uppercase text-[#63d6c9]">
                    {index === 0 ? "Beginner Friendly" : index === 3 ? "Advanced" : "Training"}
                  </span>
                </div>
                <div className="relative p-5">
                  <span className="-mt-10 mb-5 grid h-14 w-14 place-items-center rounded-full border border-[#63d6c9]/30 bg-[#0e5c55] text-white shadow-[0_18px_42px_rgba(0,0,0,0.24)]">
                    {index === 0 ? <GraduationCap className="h-6 w-6" /> : index === 1 ? <Car className="h-6 w-6" /> : index === 2 ? <ShieldCheck className="h-6 w-6" /> : <Medal className="h-6 w-6" />}
                  </span>
                  <h3 className="text-2xl font-black">{course.name}</h3>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-white/66">Structured training with expert guidance, branch scheduling, and license workflow support.</p>
                  <div className="mt-5 grid gap-2 text-sm font-semibold text-white/72">
                    {(course.installments.length ? course.installments.slice(0, 4) : [{ id: "basic", purpose: "Basic Controls" }]).map((item) => (
                      <span className="inline-flex items-center gap-2" key={item.id}>
                        <CheckCircle2 className="h-4 w-4 text-[#1fb6a6]" />
                        {"purpose" in item ? item.purpose : "Training"}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
                    <span className="inline-flex items-center gap-2 text-white/78"><Clock3 className="h-4 w-4 text-[#f6bd55]" /> {course.durationDays} Days</span>
                    <span className="font-black text-[#f6bd55]">Rs {course.totalAmount}</span>
                  </div>
                  <Link className="premium-outline mt-5 inline-flex w-full justify-center rounded-md px-4 py-3 text-sm font-black" href="/courses">
                    VIEW DETAILS -&gt;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto grid max-w-7xl gap-5 rounded-md border border-white/12 bg-white/6 p-7 backdrop-blur-xl md:grid-cols-4">
          {trustItems.map(([Icon, title, text]) => (
            <div className="flex items-center gap-4 border-white/10 md:border-r md:last:border-r-0" key={title}>
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#0e5c55] text-white">
                <Icon className="h-7 w-7" />
              </span>
              <span>
                <span className="block font-black">{title}</span>
                <span className="mt-1 block text-sm text-white/60">{text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto grid max-w-7xl gap-5 rounded-md border border-[#f6bd55]/24 bg-[linear-gradient(90deg,rgba(7,35,33,0.94),rgba(7,35,33,0.78)),url('https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1600&q=85')] bg-cover p-8 md:grid-cols-[1fr_280px_260px] md:items-center">
          <div>
            <p className="premium-kicker">Ready to begin?</p>
            <h2 className="mt-3 text-3xl font-black leading-tight">Start your journey towards becoming a confident driver today!</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-[#f6bd55]/45 text-[#f6bd55]"><Phone className="h-6 w-6" /></span>
            <span>
              <span className="block text-sm text-white/58">Call Us Now</span>
              <span className="text-2xl font-black text-[#f6bd55]">72491 05382</span>
            </span>
          </div>
          <Link href="/enquiry" className="gold-button inline-flex justify-center rounded-md px-5 py-4 text-sm font-black">
            BOOK A CLASS NOW -&gt;
          </Link>
        </div>
      </section>

      <section className="px-5 pb-10">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-md border border-white/10 bg-[#030d0c] p-6 text-sm text-white/62 md:grid-cols-[1fr_1fr_1.2fr]">
          <div>
            <p className="text-lg font-black text-white">SHIV SUMAN</p>
            <p className="mt-3 max-w-xs">Your trusted partner in building confident, responsible and safe drivers since 1998.</p>
          </div>
          <div>
            <p className="font-black uppercase text-white">Quick Links</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["Home", "Courses", "Cars", "Branches", "Contact", "Login"].map((item) => (
                <Link href={item === "Home" ? "/" : `/${item.toLowerCase()}`} key={item}>{item}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-black uppercase text-white">Contact Info</p>
            <p className="mt-3">Gala No L-10 Waterfront Apartment, Near Rankala D Mart 416012</p>
            <p className="mt-2 text-[#f6bd55]">72491 05382</p>
          </div>
        </div>
      </section>
    </main>
  );
}
