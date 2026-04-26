export default function KpiCard({ title, value, subtitle }) {
  return (
    <article className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.16em] text-on-surface-variant">{title}</p>
      <p className="mt-3 text-3xl font-headline font-bold text-on-surface">{value}</p>
      {subtitle ? <p className="mt-2 text-xs text-on-surface-variant">{subtitle}</p> : null}
    </article>
  );
}
