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
    <div className="premium-card p-5">
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
