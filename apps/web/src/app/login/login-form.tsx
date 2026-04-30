"use client";

import { useState } from "react";
import { apiBaseUrl, isHostedDemoMode } from "@/lib/api";

type LoginState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

export function LoginForm() {
  const [identifier, setIdentifier] = useState("admin@shivsuman.local");
  const [password, setPassword] = useState("Akash@1500");
  const [state, setState] = useState<LoginState>({ status: "idle", message: "" });

  async function submitLogin() {
    setState({ status: "loading", message: "Checking login..." });

    if (isHostedDemoMode()) {
      localStorage.setItem("shiv_suman_token", "demo-vercel-session");
      localStorage.setItem("shiv_suman_user", JSON.stringify({
        id: "demo-admin",
        fullName: "Akash Uday Desai",
        email: identifier,
        role: "ADMIN"
      }));
      setState({ status: "success", message: "Demo login ready. Opening dashboard..." });
      window.location.href = "/dashboard/admin";
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);
    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
        signal: controller.signal
      });
    } catch {
      setState({ status: "error", message: "API is not reachable. Start the local API or add NEXT_PUBLIC_API_URL on Vercel." });
      return;
    } finally {
      window.clearTimeout(timeoutId);
    }

    if (!response.ok) {
      setState({ status: "error", message: "Login failed. Check email/phone and password." });
      return;
    }

    const data = await response.json();
    localStorage.setItem("shiv_suman_token", data.token);
    localStorage.setItem("shiv_suman_user", JSON.stringify(data.user));
    setState({ status: "success", message: `Welcome ${data.user.fullName}. Redirecting to dashboard...` });
    window.location.href = "/dashboard/admin";
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={(event) => event.preventDefault()}>
      <label className="grid gap-2 text-sm font-medium">
        Email or phone
        <input
          className="rounded-md border border-black/15 px-3 py-3"
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="Enter email or phone"
          value={identifier}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <input
          className="rounded-md border border-black/15 px-3 py-3"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          type="password"
          value={password}
        />
      </label>
      <button
        className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white disabled:opacity-60"
        disabled={state.status === "loading"}
        onClick={submitLogin}
        type="button"
      >
        {state.status === "loading" ? "Logging in..." : "Continue"}
      </button>
      {state.message ? (
        <p className={state.status === "error" ? "text-sm font-medium text-red-600" : "text-sm font-medium text-brand-teal"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
