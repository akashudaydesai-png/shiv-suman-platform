"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Checking secure access...");

  useEffect(() => {
    const token = localStorage.getItem("shiv_suman_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (token === "demo-vercel-session") {
      setReady(true);
      return;
    }

    let cancelled = false;

    async function verifySession() {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });

        if (!response.ok) {
          localStorage.removeItem("shiv_suman_token");
          localStorage.removeItem("shiv_suman_user");
          if (!cancelled) {
            setMessage("Your login expired. Redirecting to sign in...");
          }
          window.location.href = "/login";
          return;
        }

        if (!cancelled) {
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setMessage("Unable to verify login. Please try again.");
        }
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-mist px-5 text-center">
        <p className="font-semibold text-brand-ink">{message}</p>
      </div>
    );
  }

  return <>{children}</>;
}
