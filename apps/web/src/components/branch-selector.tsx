"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type Branch = { id: string; name: string };

export function BranchSelector() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selected, setSelected] = useState("all");

  useEffect(() => {
    setSelected(localStorage.getItem("shiv_suman_branch") ?? "all");
    fetch(`${apiBaseUrl}/public/branches`)
      .then((response) => response.ok ? response.json() : [])
      .then(setBranches)
      .catch(() => setBranches([]));
  }, []);

  function changeBranch(value: string) {
    setSelected(value);
    localStorage.setItem("shiv_suman_branch", value);
    window.dispatchEvent(new CustomEvent("shiv-suman-branch-change", { detail: value }));
  }

  return (
    <select
      className="rounded-md border border-brand-teal/30 px-3 py-2 text-sm"
      onChange={(event) => changeBranch(event.target.value)}
      value={selected}
    >
      <option value="all">All branches</option>
      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>{branch.name}</option>
      ))}
    </select>
  );
}
