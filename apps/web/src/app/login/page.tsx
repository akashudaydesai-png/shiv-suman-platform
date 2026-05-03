import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="premium-shell grid min-h-screen px-5 py-8 lg:grid-cols-[1fr_460px] lg:items-center lg:gap-10 lg:px-10">
      <section className="hidden min-h-[calc(100vh-64px)] overflow-hidden rounded-md border border-black/10 bg-brand-ink text-white shadow-[0_28px_90px_rgba(16,25,22,0.18)] lg:block">
        <div className="relative h-full min-h-[calc(100vh-64px)]">
          <img alt="Premium driving school dashboard" className="absolute inset-0 h-full w-full object-cover opacity-70" src="https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1600&q=85" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,25,22,0.92),rgba(16,25,22,0.62),rgba(16,25,22,0.18))]" />
          <div className="relative flex h-full min-h-[calc(100vh-64px)] flex-col justify-between p-8">
            <Link href="/" className="inline-flex w-fit items-center gap-3 rounded-md border border-white/14 bg-white/10 px-3 py-2 font-black backdrop-blur">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-brand-ink">SS</span>
              Shiv Suman
            </Link>
            <div className="max-w-2xl premium-reveal">
              <p className="premium-kicker text-white/80">Admin command center</p>
              <h1 className="mt-4 text-5xl font-black leading-tight">One login for students, fleet, branches, payments, and RTO work.</h1>
              <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
                {["Live DB", "API Ready", "Fleet Flow"].map((item) => (
                  <div className="rounded-md border border-white/14 bg-white/10 p-4 text-sm font-black backdrop-blur" key={item}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-md rounded-md border border-black/10 bg-white/95 p-7 shadow-[0_26px_86px_rgba(16,25,22,0.14)] backdrop-blur-xl">
        <Link href="/" className="text-sm font-black text-brand-teal">
          Shiv Suman Motor Training
        </Link>
        <p className="mt-6 premium-kicker">Secure login</p>
        <h2 className="mt-2 text-3xl font-black text-brand-ink">Welcome back</h2>
        <p className="mt-2 text-sm font-semibold text-black/56">Open the live dashboard with your admin access.</p>
        <LoginForm />
      </section>
    </main>
  );
}
