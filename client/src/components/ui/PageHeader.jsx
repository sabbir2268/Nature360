import { cn } from "../../utils/cn";

export default function PageHeader({ eyebrow, title, description, actions, className = "", compact = false }) {
  const Heading = compact ? "h2" : "h1";
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            {eyebrow}
          </p>
        )}
        <Heading
          className={cn(
            "mt-1 font-display font-extrabold text-forest-950",
            compact ? "text-lg tracking-[-0.03em]" : "text-2xl tracking-[-0.04em]",
          )}
        >
          {title}
        </Heading>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
