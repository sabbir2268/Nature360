import { cn } from "../../utils/cn";

function TextField({ id, label, icon: Icon, rightElement, className = "", ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-bold text-forest-900">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          id={id}
          className={cn(
            "h-12 w-full rounded-xl border border-forest-900/10 bg-white/80 px-4 text-sm text-forest-950 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10",
            Icon && "pl-10",
            rightElement && "pr-11",
            className,
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

export default TextField;
