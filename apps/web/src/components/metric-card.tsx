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
      <p className="text-sm font-bold text-black/58">{label}</p>
      <p
        className={
          tone === "orange"
            ? "mt-3 text-3xl font-black text-brand-orange"
            : "mt-3 text-3xl font-black text-brand-teal"
        }
      >
        {value}
      </p>
    </div>
  );
}
