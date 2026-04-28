import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-mist px-5">
      <section className="w-full max-w-md rounded-md border border-brand-teal/20 bg-white p-8 shadow-soft">
        <Link href="/" className="text-sm font-semibold text-brand-teal">
          Shiv Suman Motor Training
        </Link>
        <h1 className="mt-5 text-3xl font-bold text-brand-ink">Login</h1>
        <LoginForm />
      </section>
    </main>
  );
}
