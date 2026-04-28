export function MetricCard({
  label,
  value,
  tone = "teal"
}: {
  label: string;
  value: string;
  tone?: "teal" | "orange";
}) {
  return (
    <div className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-black/60">{label}</p>
      <p
        className={
          tone === "orange"
            ? "mt-3 text-3xl font-bold text-brand-orange"
            : "mt-3 text-3xl font-bold text-brand-teal"
        }
      >
        {value}
      </p>
    </div>
  );
}
