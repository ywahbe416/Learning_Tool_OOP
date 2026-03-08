import type { ReactNode } from "react";

interface VisualizationCardProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  accentClassName?: string;
  objective?: string;
  insights?: ReactNode;
  children: ReactNode;
}

export default function VisualizationCard({
  title,
  subtitle,
  eyebrow = "Interactive Lab",
  accentClassName = "from-cyan-400/20 via-sky-400/10 to-transparent",
  objective,
  insights,
  children,
}: VisualizationCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900/90 shadow-[0_24px_80px_rgba(15,23,42,0.45)]">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${accentClassName}`}
      />
      <div className="relative border-b border-slate-800 px-6 py-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
          {eyebrow}
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold text-slate-50">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
          </div>
          {objective && (
            <div className="max-w-sm rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Objective
              </p>
              <p className="mt-2 text-sm text-slate-300">{objective}</p>
            </div>
          )}
        </div>
        {insights && <div className="mt-4">{insights}</div>}
      </div>
      <div className="relative px-6 py-6">{children}</div>
    </section>
  );
}
