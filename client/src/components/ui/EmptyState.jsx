import { cn } from "../../utils/cn";

function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div className={cn("rounded-[1.75rem] border border-dashed border-forest-900/15 bg-white/45 px-6 py-12 text-center", className)}>
      {Icon && (
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-700">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <h3 className="mt-4 font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-[11px] leading-6 text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center gap-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
